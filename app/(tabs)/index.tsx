import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Bell, User, Edit2, Flame, TrendingDown } from "lucide-react-native";
import { useAuthStore } from "../../src/store/authStore";
import { getUserProfile, UserProfile } from "../../src/services/userService";
import { getDailyMeals, Meal } from "../../src/services/mealService";

export default function DashboardScreen() {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            try {
                const [userProfile, todayMeals] = await Promise.all([
                    getUserProfile(user.uid),
                    getDailyMeals(user.uid, today)
                ]);
                setProfile(userProfile);
                setMeals(todayMeals);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user]);

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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Text style={{ fontSize: 24 }}>☰</Text>
                    </TouchableOpacity>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Bell size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.avatar}>
                            <User size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Greeting */}
                <View style={styles.greeting}>
                    <Text style={styles.greetingText}>Hellooooo</Text>
                    <Text style={styles.nameText}>{profile?.name || 'User'}</Text>
                </View>

                {/* Progress Card */}
                <LinearGradient
                    colors={['#6D28D9', '#A78BFA']}
                    style={styles.progressCard}
                >
                    <View style={styles.progressTextSection}>
                        <Text style={styles.progressTitle}>Your Progress</Text>
                        <Text style={styles.progressPercent}>{progressPercent}%</Text>
                        <Text style={styles.progressDate}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</Text>
                    </View>
                    <View style={styles.progressGoalCard}>
                        <Text style={styles.consumedKcal}>{consumedCalories}</Text>
                        <Text style={styles.kcalUnit}>Calories</Text>
                    </View>
                </LinearGradient>

                <View style={styles.statsRow}>
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
                </View>

                {/* Recent Meals */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Today's Meals</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                {meals.length === 0 ? (
                    <View style={styles.emptyMeals}>
                        <Text style={styles.emptyText}>No meals logged today yet.</Text>
                    </View>
                ) : (
                    meals.map((meal) => (
                        <View key={meal.id} style={styles.mealCard}>
                            <View style={styles.mealInfo}>
                                <Text style={styles.mealName}>{meal.foodName}</Text>
                                <Text style={styles.mealMacros}>P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g</Text>
                            </View>
                            <View style={styles.mealRight}>
                                <Text style={styles.mealKcal}>{meal.calories} kcal</Text>
                                <Edit2 size={16} color="#7C5CFF" />
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
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
    greetingText: {
        color: '#999',
        fontSize: 18,
    },
    nameText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
    progressCard: {
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
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
});
