import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock, Trash2, ChevronRight, Calendar as CalendarIcon } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/authStore';
import { getAllMeals, Meal, deleteMeal } from '../../src/services/mealService';

interface GroupedMeal {
    date: string;
    meals: Meal[];
    totalCalories: number;
}

export default function HistoryScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [groupedHistory, setGroupedHistory] = useState<GroupedMeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = useCallback(async () => {
        if (!user) return;
        try {
            const meals = await getAllMeals(user.uid);

            // Group by date
            const groups: { [key: string]: Meal[] } = {};
            meals.forEach(meal => {
                if (!groups[meal.date]) groups[meal.date] = [];
                groups[meal.date].push(meal);
            });

            const sortedGroups: GroupedMeal[] = Object.keys(groups)
                .sort((a, b) => b.localeCompare(a))
                .map(date => ({
                    date,
                    meals: groups[date],
                    totalCalories: groups[date].reduce((sum, m) => sum + m.calories, 0)
                }));

            setGroupedHistory(sortedGroups);
        } catch (error) {
            console.error("Error fetching history:", error);
            Alert.alert("Error", "Failed to load meal history.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    const handleDelete = (mealId: string) => {
        if (!user) return;
        Alert.alert(
            "Delete Meal",
            "Are you sure you want to delete this meal entry?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteMeal(user.uid, mealId);
                            fetchHistory();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete meal.");
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (dateStr === today) return 'Today';
        if (dateStr === yesterday) return 'Yesterday';

        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderMealItem = ({ item }: { item: Meal }) => (
        <View style={styles.mealItem}>
            <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{item.foodName}</Text>
                <Text style={styles.mealMacros}>
                    {item.calories} kcal • {item.protein}g P • {item.carbs}g C • {item.fat}g F
                </Text>
            </View>
            <TouchableOpacity
                onPress={() => item.id && handleDelete(item.id)}
                style={styles.deleteButton}
            >
                <Trash2 size={18} color="#FF4D4D" />
            </TouchableOpacity>
        </View>
    );

    const renderGroup = ({ item }: { item: GroupedMeal }) => (
        <View style={styles.groupContainer}>
            <View style={styles.groupHeader}>
                <View style={styles.dateRow}>
                    <CalendarIcon size={16} color="#7C5CFF" />
                    <Text style={styles.groupDate}>{formatDate(item.date)}</Text>
                </View>
                <Text style={styles.groupTotal}>{item.totalCalories} kcal total</Text>
            </View>
            {item.meals.map(meal => (
                <View key={meal.id}>
                    {renderMealItem({ item: meal })}
                </View>
            ))}
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7C5CFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Clock size={32} color="#7C5CFF" />
                <Text style={styles.title}>History</Text>
            </View>

            <FlatList
                data={groupedHistory}
                keyExtractor={(item) => item.date}
                renderItem={renderGroup}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C5CFF" />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No meals logged yet.</Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => router.push('/(tabs)/scan')}
                        >
                            <Text style={styles.emptyButtonText}>Log your first meal</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
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
    header: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    listContent: {
        padding: 20,
        paddingTop: 0,
    },
    groupContainer: {
        marginBottom: 24,
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    groupDate: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    groupTotal: {
        color: '#999',
        fontSize: 14,
    },
    mealItem: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    mealInfo: {
        flex: 1,
    },
    mealName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    mealMacros: {
        color: '#888',
        fontSize: 12,
    },
    deleteButton: {
        padding: 8,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
        marginBottom: 20,
    },
    emptyButton: {
        backgroundColor: '#7C5CFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
