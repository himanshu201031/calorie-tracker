import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Sparkles, Plus, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { generateMealPlan, MealPlanItem } from '../src/services/plannerService';
import { useAuthStore } from '../src/store/authStore';
import { getUserProfile } from '../src/services/userService';
import { logMeal } from '../src/services/mealService';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function MealPlannerScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState<MealPlanItem[]>([]);
    const [targetKcal, setTargetKcal] = useState(2000);

    const loadPlan = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const profile = await getUserProfile(user.uid);
            const target = profile?.calorieTarget || 2000;
            setTargetKcal(target);
            const newPlan = await generateMealPlan(target);
            setPlan(newPlan);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlan();
    }, []);

    const handleAddMeal = async (item: MealPlanItem) => {
        if (!user) return;
        try {
            await logMeal(user.uid, {
                foodName: item.foodName,
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat,
                source: 'AI',
                category: item.meal as any,
                date: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            });
            router.push('/(tabs)');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AI Meal Planner</Text>
                <TouchableOpacity onPress={loadPlan} disabled={loading}>
                    <RefreshCw size={20} color="#7C5CFF" className={loading ? 'animate-spin' : ''} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.targetCard}>
                    <LinearGradient
                        colors={['#7C5CFF', '#9479FF']}
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Sparkles size={32} color="rgba(255,255,255,0.3)" style={styles.sparkleIcon} />
                        <Text style={styles.targetLabel}>Daily Goal</Text>
                        <Text style={styles.targetValue}>{targetKcal} kcal</Text>
                        <Text style={styles.targetSub}>AI-optimized menu for your needs</Text>
                    </LinearGradient>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#7C5CFF" />
                        <Text style={styles.loadingText}>Gemini is crafting your plan...</Text>
                    </View>
                ) : (
                    plan.map((item, index) => (
                        <Animated.View
                            entering={FadeInDown.delay(index * 100)}
                            key={index}
                            style={styles.mealCard}
                        >
                            <View style={styles.mealHeader}>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>{item.meal}</Text>
                                </View>
                                <Text style={styles.kcalText}>{item.calories} kcal</Text>
                            </View>

                            <Text style={styles.foodName}>{item.foodName}</Text>

                            <View style={styles.macrosRow}>
                                <Text style={styles.macroText}>P: {item.protein}g</Text>
                                <Text style={styles.macroText}>C: {item.carbs}g</Text>
                                <Text style={styles.macroText}>F: {item.fat}g</Text>
                            </View>

                            <View style={styles.reasonBox}>
                                <Text style={styles.reasonText}>💡 {item.reason}</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => handleAddMeal(item)}
                            >
                                <Plus size={18} color="#FFF" />
                                <Text style={styles.addButtonText}>Add to Log</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
    },
    targetCard: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
    },
    gradient: {
        padding: 24,
        position: 'relative',
    },
    sparkleIcon: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    targetLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
    },
    targetValue: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: 'bold',
        marginVertical: 4,
    },
    targetSub: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        color: '#666',
        marginTop: 16,
        fontSize: 14,
    },
    mealCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    mealHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tag: {
        backgroundColor: 'rgba(124, 92, 255, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        color: '#7C5CFF',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    kcalText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    foodName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    macrosRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    macroText: {
        color: '#888',
        fontSize: 12,
    },
    reasonBox: {
        backgroundColor: '#262626',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    reasonText: {
        color: '#AAA',
        fontSize: 12,
        lineHeight: 18,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#7C5CFF',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    addButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    }
});
