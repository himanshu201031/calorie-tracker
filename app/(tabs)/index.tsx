import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { Bell, User, Edit2, Flame, TrendingDown, Menu, Mic, Brain, StopCircle, Loader2 } from "lucide-react-native";
import { useAuthStore } from "../../src/store/authStore";
import { getUserProfile, UserProfile } from "../../src/services/userService";
import { getDailyMeals, Meal, logMeal } from "../../src/services/mealService";
import Animated, { FadeInDown, FadeInRight, FadeIn, ZoomIn, ZoomOut } from "react-native-reanimated";
import { Audio } from 'expo-av';
import { startRecording, stopRecording, analyzeAudioMeal } from "../../src/services/voiceService";
import { Alert } from "react-native";

export default function DashboardScreen() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [recording, setRecording] = useState<Audio.Recording | undefined>();
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            const [userProfile, dayMeals] = await Promise.all([
                getUserProfile(user.uid),
                getDailyMeals(user.uid, selectedDate)
            ]);
            setProfile(userProfile);
            setMeals(dayMeals);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, [user, selectedDate]);

    const handleStartRecording = async () => {
        try {
            const rec = await startRecording();
            if (rec) {
                setRecording(rec);
                setIsRecording(true);
            }
        } catch (error) {
            Alert.alert("Error", "Could not start recording.");
        }
    };

    const handleStopRecording = async () => {
        if (!recording || !user) return;
        try {
            setIsRecording(false);
            setIsAnalyzing(true);
            const base64Audio = await stopRecording(recording);
            if (base64Audio) {
                const analysis = await analyzeAudioMeal(base64Audio);

                // Log the meal
                await logMeal(user.uid, {
                    foodName: analysis.foodName,
                    calories: analysis.calories,
                    protein: analysis.protein,
                    carbs: analysis.carbs,
                    fat: analysis.fat,
                    source: 'AI',
                    category: 'Snack', // Default for voice logs
                    date: new Date().toISOString().split('T')[0],
                    createdAt: new Date().toISOString()
                });

                Alert.alert("Success", `Logged ${analysis.foodName} (${analysis.calories} kcal)`);
                fetchData();
            }
        } catch (error) {
            Alert.alert("Error", "Failed to analyze voice log.");
        } finally {
            setIsAnalyzing(false);
            setRecording(undefined);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    // Generate week days
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - d.getDay() + i);
        return {
            date: d.toISOString().split('T')[0],
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNum: d.getDate()
        };
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7C5CFF" />
            </View>
        );
    }

    const consumedCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const calorieTarget = profile?.calorieTarget || 2000;
    const progressPercent = Math.min(Math.round((consumedCalories / calorieTarget) * 100), 100);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Menu size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => router.push('/meal-planner')}
                        >
                            <Brain size={24} color="#7C5CFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Bell size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.avatar}>
                            <User size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Greeting & Date Selector */}
                <View style={styles.greetingSection}>
                    <View>
                        <Text style={styles.greetingText}>Hellooooo</Text>
                        <Text style={styles.nameText}>{profile?.name || 'User'}</Text>
                    </View>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.dateSelector}
                    contentContainerStyle={styles.dateSelectorContent}
                >
                    {weekDays.map((item) => {
                        const isSelected = item.date === selectedDate;
                        return (
                            <TouchableOpacity
                                key={item.date}
                                style={[styles.dateItem, isSelected && styles.dateItemActive]}
                                onPress={() => setSelectedDate(item.date)}
                            >
                                <Text style={[styles.dayName, isSelected && styles.dateTextActive]}>{item.dayName}</Text>
                                <Text style={[styles.dayNum, isSelected && styles.dateTextActive]}>{item.dayNum}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Progress Card */}
                <Animated.View entering={FadeInDown.delay(200)}>
                    <LinearGradient
                        colors={['#7C5CFF', '#C084FC']}
                        style={styles.progressCard}
                    >
                        <View style={styles.progressHeader}>
                            <View style={styles.progressTextSection}>
                                <Text style={styles.progressTitle}>Your Progress</Text>
                                <Text style={styles.progressPercent}>{progressPercent}%</Text>
                                <Text style={styles.progressDate}>
                                    {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                </Text>
                            </View>
                            {profile?.currentStreak && profile.currentStreak > 0 ? (
                                <View style={styles.streakBadge}>
                                    <Flame size={20} color="#FACC15" fill="#FACC15" />
                                    <Text style={styles.streakText}>{profile.currentStreak} Day Streak</Text>
                                </View>
                            ) : null}
                        </View>
                        <View style={styles.progressGoalCard}>
                            <Text style={styles.consumedKcal}>{consumedCalories}</Text>
                            <Text style={styles.kcalUnit}>Calories</Text>
                        </View>
                    </LinearGradient>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400)} style={styles.statsRow}>
                    {/* Weight Card */}
                    <View style={[styles.statCard, { backgroundColor: '#FB923C' }]}>
                        <View style={styles.statHeader}>
                            <Text style={styles.statLabel}>Weight</Text>
                            <TrendingDown size={16} color="#FFFFFF" />
                        </View>
                        <Text style={styles.statValue}>{profile?.weight || '--'} kg</Text>
                        <Text style={styles.statSubValue}>Goal: {profile?.goal || '--'}</Text>
                    </View>

                    {/* Calorie Card */}
                    <View style={[styles.statCard, { backgroundColor: '#FACC15' }]}>
                        <View style={styles.statHeader}>
                            <Text style={styles.statLabel}>Target</Text>
                            <Flame size={16} color="#FFFFFF" />
                        </View>
                        <Text style={styles.statValue}>{calorieTarget}</Text>
                        <Text style={styles.statSubValue}>Kcal / day</Text>
                    </View>
                </Animated.View>

                {/* Today's Meals Grouped */}
                <Animated.View entering={FadeInDown.delay(600)}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Today's Meals</Text>
                    </View>

                    {meals.length === 0 ? (
                        <View style={styles.emptyMeals}>
                            <Text style={styles.emptyText}>No meals logged today yet.</Text>
                        </View>
                    ) : (
                        (['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map((category) => {
                            const categoryMeals = meals.filter(m => m.category === category);
                            if (categoryMeals.length === 0) return null;

                            return (
                                <View key={category} style={styles.categorySection}>
                                    <View style={styles.categoryHeader}>
                                        <Text style={styles.categoryTitle}>{category}</Text>
                                        <Text style={styles.categoryKcal}>
                                            {categoryMeals.reduce((sum, m) => sum + m.calories, 0)} kcal
                                        </Text>
                                    </View>
                                    {categoryMeals.map((meal) => (
                                        <Animated.View entering={FadeInRight} key={meal.id} style={styles.mealCard}>
                                            <View style={styles.mealInfo}>
                                                <Text style={styles.mealName}>{meal.foodName}</Text>
                                                <Text style={styles.mealMacros}>P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g</Text>
                                            </View>
                                            <View style={styles.mealRight}>
                                                <Text style={styles.mealKcal}>{meal.calories} kcal</Text>
                                                <Edit2 size={16} color="#7C5CFF" />
                                            </View>
                                        </Animated.View>
                                    ))}
                                </View>
                            );
                        })
                    )}
                </Animated.View>
            </ScrollView>

            {/* AI Voice Assistant Floating Button */}
            <TouchableOpacity
                style={[styles.voiceFab, isRecording && styles.voiceFabRecording]}
                onPress={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isAnalyzing}
            >
                {isAnalyzing ? (
                    <Loader2 size={24} color="#FFF" className="animate-spin" />
                ) : isRecording ? (
                    <StopCircle size={24} color="#FFF" />
                ) : (
                    <Mic size={24} color="#FFF" />
                )}
            </TouchableOpacity>

            {isRecording && (
                <Animated.View
                    entering={ZoomIn}
                    exiting={ZoomOut}
                    style={styles.recordingOverlay}
                >
                    <Text style={styles.recordingText}>Listening...</Text>
                    <Text style={styles.recordingSubText}>Tap again to analyze</Text>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F0F',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0F0F0F',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#7C5CFF',
    },
    greeting: {
        marginBottom: 24,
    },
    greetingSection: {
        marginBottom: 20,
    },
    greetingText: {
        fontSize: 16,
        color: '#999',
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    dateSelector: {
        marginBottom: 24,
    },
    dateSelectorContent: {
        paddingRight: 20,
    },
    dateItem: {
        width: 60,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        marginRight: 10,
    },
    dateItemActive: {
        backgroundColor: '#FFF',
    },
    dayName: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    dayNum: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    dateTextActive: {
        color: '#000',
    },
    progressCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 30,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    streakText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressTextSection: {
        flex: 1,
    },
    progressTitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    progressPercent: {
        color: '#FFFFFF',
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    progressDate: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    progressGoalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        minWidth: 100,
    },
    consumedKcal: {
        color: '#000000',
        fontSize: 20,
        fontWeight: 'bold',
    },
    kcalUnit: {
        color: '#666',
        fontSize: 12,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        borderRadius: 20,
        padding: 16,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statLabel: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.9,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    statSubValue: {
        color: '#FFFFFF',
        fontSize: 10,
        opacity: 0.8,
        marginTop: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    seeAll: {
        color: '#7C5CFF',
        fontSize: 14,
    },
    categorySection: {
        marginBottom: 24,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    categoryTitle: {
        color: '#999',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    categoryKcal: {
        color: '#666',
        fontSize: 12,
    },
    mealCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    mealInfo: {
        flex: 1,
    },
    mealName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    mealMacros: {
        color: '#666',
        fontSize: 12,
    },
    mealRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    mealKcal: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyMeals: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#666',
        fontSize: 14,
    },
    voiceFab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#7C5CFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#7C5CFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    voiceFabRecording: {
        backgroundColor: '#FF4D4D',
        transform: [{ scale: 1.1 }],
    },
    recordingOverlay: {
        position: 'absolute',
        top: '40%',
        left: '10%',
        right: '10%',
        backgroundColor: 'rgba(0,0,0,0.85)',
        padding: 30,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(124, 92, 255, 0.3)',
    },
    recordingText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    recordingSubText: {
        color: '#999',
        fontSize: 14,
    },
});
