import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Svg, Circle, G, Path } from "react-native-svg";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Plus, Droplet, Sparkles, Info } from "lucide-react-native";
import { useAuthStore } from "../../src/store/authStore";
import { getUserProfile, UserProfile } from "../../src/services/userService";
import { getDailyMeals, Meal, getWeeklyMeals } from "../../src/services/mealService";
import { getDailyWater, logWater, getWeeklyWater } from "../../src/services/waterService";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, ZoomIn, FadeIn } from "react-native-reanimated";

const RING_SIZE = 180;
const STROKE_WIDTH = 15;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function StatsScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [water, setWater] = useState(0);
    const [weeklyCalories, setWeeklyCalories] = useState<{ date: string, calories: number }[]>([]);

    const today = new Date().toISOString().split('T')[0];

    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            const [userProfile, todayMeals, todayWater, weekCals] = await Promise.all([
                getUserProfile(user.uid),
                getDailyMeals(user.uid, today),
                getDailyWater(user.uid, today),
                getWeeklyMeals(user.uid)
            ]);
            setProfile(userProfile);
            setMeals(todayMeals);
            setWater(todayWater);
            setWeeklyCalories(weekCals);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    }, [user, today]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const handleAddWater = async () => {
        if (!user) return;
        try {
            await logWater(user.uid, 250); // Add 250ml
            setWater(prev => prev + 250);
        } catch (error) {
            console.error("Error logging water:", error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7C5CFF" />
            </View>
        );
    }

    const calorieTarget = profile?.calorieTarget || 2000;
    const consumedCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const remainingCalories = Math.max(0, calorieTarget - consumedCalories);
    const progress = Math.min(consumedCalories / calorieTarget, 1);
    const strokeDashoffset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

    const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
    const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
    const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

    // Dynamic Macro Targets (30% Protein, 40% Carbs, 30% Fat)
    const proteinTarget = Math.round((calorieTarget * 0.3) / 4);
    const carbsTarget = Math.round((calorieTarget * 0.4) / 4);
    const fatTarget = Math.round((calorieTarget * 0.3) / 9);

    const maxWeekCal = Math.max(...weeklyCalories.map(d => d.calories), 1);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Statistics</Text>
                    <TouchableOpacity style={styles.infoButton}>
                        <Info size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* AI Insights Banner */}
                <Animated.View entering={FadeInDown.delay(100)}>
                    <TouchableOpacity onPress={() => router.push('/insights')} style={styles.insightBannerWrapper}>
                        <LinearGradient
                            colors={['#7C5CFF', '#4F46E5']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.insightBanner}
                        >
                            <View style={styles.insightContent}>
                                <View style={styles.insightIcon}>
                                    <Sparkles size={20} color="#7C5CFF" />
                                </View>
                                <View>
                                    <Text style={styles.insightTitle}>Weekly AI Insights</Text>
                                    <Text style={styles.insightSub}>Get personalized health tips</Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* Circular Progress Ring */}
                <Animated.View entering={ZoomIn.delay(300)} style={styles.ringContainer}>
                    <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
                        <G rotation="-90" origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}>
                            <Circle
                                cx={RING_SIZE / 2}
                                cy={RING_SIZE / 2}
                                r={RADIUS}
                                stroke="#1A1A1A"
                                strokeWidth={STROKE_WIDTH}
                                fill="transparent"
                            />
                            <Circle
                                cx={RING_SIZE / 2}
                                cy={RING_SIZE / 2}
                                r={RADIUS}
                                stroke="#FB923C"
                                strokeWidth={STROKE_WIDTH}
                                strokeDasharray={CIRCUMFERENCE}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                fill="transparent"
                            />
                        </G>
                    </Svg>
                    <View style={styles.ringTextContainer}>
                        <Text style={styles.remainingKcal}>{remainingCalories}</Text>
                        <Text style={styles.remainingLabel}>Kcal Left</Text>
                    </View>
                </Animated.View>

                {/* Macros Breakdown */}
                <Animated.View entering={FadeInDown.delay(500)} style={styles.macrosRow}>
                    <MacroItem label="Protein" value={totalProtein} color="#7C5CFF" target={proteinTarget} />
                    <MacroItem label="Carbs" value={totalCarbs} color="#FACC15" target={carbsTarget} />
                    <MacroItem label="Fat" value={totalFat} color="#FB923C" target={fatTarget} />
                </Animated.View>

                {/* Water Intake Section */}
                <Animated.View entering={FadeInDown.delay(700)} style={styles.waterCard}>
                    <View style={styles.waterHeader}>
                        <View>
                            <Text style={styles.waterTitle}>Water Intake</Text>
                            <Text style={styles.waterSubtitle}>{water} ml / 2000 ml</Text>
                        </View>
                        <TouchableOpacity style={styles.addButton} onPress={handleAddWater}>
                            <Plus size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.waterVisual}>
                        <View style={[styles.waterFill, { height: `${Math.min((water / 2000) * 100, 100)}%` }]} />
                        <Droplet size={40} color="rgba(255,255,255,0.2)" style={styles.dropletIcon} />
                    </View>
                </Animated.View>

                {/* Weekly Comparison */}
                <Animated.View entering={FadeInDown.delay(900)}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Weekly Activity</Text>
                        <View style={styles.seeAll}>
                            <Text style={styles.seeAllText}>Last 7 Days</Text>
                        </View>
                    </View>

                    <View style={styles.chartContainer}>
                        {weeklyCalories.map((day, i) => {
                            const dayName = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(day.date).getDay()];
                            const heightPercent = (day.calories / maxWeekCal) * 100;
                            const isToday = day.date === today;

                            return (
                                <View key={i} style={styles.chartBarGroup}>
                                    <View style={styles.chartBarBackground}>
                                        <View style={[
                                            styles.chartBarFill,
                                            {
                                                height: `${Math.max(heightPercent, 5)}%`,
                                                backgroundColor: isToday ? '#7C5CFF' : '#333'
                                            }
                                        ]} />
                                    </View>
                                    <Text style={[styles.chartDayText, isToday && styles.chartDayTextActive]}>{dayName}</Text>
                                </View>
                            );
                        })}
                    </View>
                </Animated.View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

function MacroItem({ label, value, color, target }: { label: string, value: number, color: string, target: number }) {
    const progress = Math.min(value / target, 1);
    return (
        <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>{label}</Text>
            <View style={styles.macroBarBg}>
                <View style={[styles.macroBarFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
            </View>
            <Text style={styles.macroValue}>{value}g</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F0F',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F0F0F',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
    },
    infoButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ringContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    ringTextContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    remainingKcal: {
        fontSize: 42,
        fontWeight: '900',
        color: '#FFF',
    },
    remainingLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: -5,
    },
    macrosRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        backgroundColor: '#1A1A1A',
        padding: 20,
        borderRadius: 24,
    },
    macroItem: {
        flex: 1,
        alignItems: 'center',
    },
    macroLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    macroBarBg: {
        width: '80%',
        height: 4,
        backgroundColor: '#262626',
        borderRadius: 2,
        marginBottom: 8,
        overflow: 'hidden',
    },
    macroBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    macroValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFF',
    },
    waterCard: {
        backgroundColor: '#FACC15',
        borderRadius: 24,
        padding: 20,
        marginBottom: 30,
        overflow: 'hidden',
    },
    waterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        zIndex: 2,
    },
    waterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    waterSubtitle: {
        fontSize: 14,
        color: 'rgba(0,0,0,0.6)',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    waterVisual: {
        height: 100,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 16,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    waterFill: {
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderTopWidth: 2,
        borderColor: 'rgba(0,0,0,0.2)',
    },
    dropletIcon: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -20,
        marginLeft: -20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    seeAll: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        fontSize: 14,
        color: '#7C5CFF',
        marginRight: 4,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 150,
        backgroundColor: '#1A1A1A',
        padding: 20,
        borderRadius: 24,
    },
    chartBarGroup: {
        alignItems: 'center',
        height: '100%',
        justifyContent: 'flex-end',
    },
    chartBarBackground: {
        width: 12,
        height: '80%',
        backgroundColor: '#262626',
        borderRadius: 6,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    chartBarFill: {
        width: '100%',
        backgroundColor: '#7C5CFF',
        borderRadius: 6,
    },
    chartDayText: {
        fontSize: 10,
        color: '#666',
        marginTop: 8,
    },
    chartDayTextActive: {
        color: '#7C5CFF',
        fontWeight: 'bold',
    },
    insightBannerWrapper: {
        marginBottom: 24,
    },
    insightBanner: {
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    insightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    insightIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    insightTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    insightSub: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
    },
});
