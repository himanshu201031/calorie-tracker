import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Award, Flame, Droplet, Utensils, Target } from "lucide-react-native";
import { useAuthStore } from "../src/store/authStore";
import { getAchievements, Achievement } from "../src/services/achievementService";

const ICON_MAP: { [key: string]: any } = {
    flame: Flame,
    droplet: Droplet,
    utensils: Utensils,
    target: Target,
    award: Award
};

export default function AchievementsScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAchievements() {
            if (user) {
                try {
                    const data = await getAchievements(user.uid);
                    setAchievements(data);
                } catch (error) {
                    console.error("Error fetching achievements:", error);
                }
            }
            setLoading(false);
        }
        fetchAchievements();
    }, [user]);

    const renderAchievement = ({ item }: { item: Achievement }) => {
        const Icon = ICON_MAP[item.icon] || Award;
        const isUnlocked = !!item.unlockedAt;
        const progressPercent = (item.progress / item.target) * 100;

        return (
            <View style={[styles.achievementCard, isUnlocked && styles.achievementUnlocked]}>
                <View style={[styles.iconContainer, isUnlocked && styles.iconUnlocked]}>
                    <Icon size={24} color={isUnlocked ? "#FFF" : "#444"} />
                </View>
                <View style={styles.details}>
                    <View style={styles.headerRow}>
                        <Text style={styles.achievementTitle}>{item.title}</Text>
                        {isUnlocked && <Award size={16} color="#FACC15" />}
                    </View>
                    <Text style={styles.achievementDesc}>{item.description}</Text>

                    {!isUnlocked && (
                        <View style={styles.progressSection}>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                            </View>
                            <Text style={styles.progressText}>
                                {item.progress} / {item.target}
                            </Text>
                        </View>
                    )}

                    {isUnlocked && (
                        <Text style={styles.unlockedDate}>
                            Unlocked on {new Date(item.unlockedAt!).toLocaleDateString()}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7C5CFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Achievements</Text>
            </View>

            <FlatList
                data={achievements}
                keyExtractor={(item) => item.id}
                renderItem={renderAchievement}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    listContent: {
        padding: 20,
    },
    achievementCard: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    achievementUnlocked: {
        borderColor: '#7C5CFF',
        backgroundColor: 'rgba(124, 92, 255, 0.05)',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#262626',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconUnlocked: {
        backgroundColor: '#7C5CFF',
    },
    details: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    achievementTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    achievementDesc: {
        fontSize: 14,
        color: '#888',
        marginBottom: 12,
    },
    progressSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: '#333',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#7C5CFF',
    },
    progressText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    unlockedDate: {
        fontSize: 12,
        color: '#7C5CFF',
        fontWeight: '600',
    },
});
