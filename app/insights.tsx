import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Brain, Sparkles, CheckCircle2, TrendingUp, Info } from "lucide-react-native";
import { useAuthStore } from "../src/store/authStore";
import { generateHealthInsights, InsightReport } from "../src/services/insightService";
import { LinearGradient } from "expo-linear-gradient";

export default function InsightsScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [insight, setInsight] = useState<InsightReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchInsights = async () => {
        if (user) {
            const data = await generateHealthInsights(user.uid);
            setInsight(data);
        }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchInsights();
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchInsights();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7C5CFF" />
                <Text style={styles.loadingText}>AI is analyzing your patterns...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>AI Insights</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C5CFF" />}
            >
                {/* Score Card */}
                <LinearGradient
                    colors={['#7C5CFF', '#4F46E5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.scoreCard}
                >
                    <View style={styles.scoreHeader}>
                        <Brain size={32} color="#FFF" />
                        <View>
                            <Text style={styles.scoreLabel}>Health Score</Text>
                            <Text style={styles.scoreSub}>Based on last 7 days</Text>
                        </View>
                    </View>
                    <View style={styles.scoreValueContainer}>
                        <Text style={styles.scoreValue}>{insight?.score || 0}</Text>
                        <Text style={styles.scoreMax}>/100</Text>
                    </View>
                </LinearGradient>

                {/* Summary Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Sparkles size={20} color="#7C5CFF" />
                        <Text style={styles.sectionTitle}>Summary</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.summaryText}>{insight?.summary}</Text>
                    </View>
                </View>

                {/* Tips Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <CheckCircle2 size={20} color="#7C5CFF" />
                        <Text style={styles.sectionTitle}>Actionable Tips</Text>
                    </View>
                    {insight?.tips.map((tip, index) => (
                        <View key={index} style={styles.tipCard}>
                            <View style={styles.tipNumber}>
                                <Text style={styles.tipNumberText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.tipText}>{tip}</Text>
                        </View>
                    ))}
                </View>

                {/* Detailed Analysis */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <TrendingUp size={20} color="#7C5CFF" />
                        <Text style={styles.sectionTitle}>Detailed Analysis</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.analysisText}>{insight?.nutritionAnalysis}</Text>
                    </View>
                </View>

                <View style={styles.disclaimer}>
                    <Info size={14} color="#666" />
                    <Text style={styles.disclaimerText}>
                        These insights are generated by AI and should not replace professional medical advice.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
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
        gap: 16,
    },
    loadingText: {
        color: '#888',
        fontSize: 16,
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
    scrollContent: {
        padding: 20,
    },
    scoreCard: {
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    scoreHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    scoreLabel: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    scoreSub: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
    },
    scoreValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    scoreValue: {
        color: '#FFF',
        fontSize: 48,
        fontWeight: 'bold',
    },
    scoreMax: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 18,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    card: {
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    summaryText: {
        color: '#CCC',
        fontSize: 16,
        lineHeight: 24,
    },
    tipCard: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        gap: 16,
    },
    tipNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(124, 92, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(124, 92, 255, 0.2)',
    },
    tipNumberText: {
        color: '#7C5CFF',
        fontWeight: 'bold',
    },
    tipText: {
        flex: 1,
        color: '#FFF',
        fontSize: 14,
        lineHeight: 20,
    },
    analysisText: {
        color: '#888',
        fontSize: 14,
        lineHeight: 22,
    },
    disclaimer: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    disclaimerText: {
        color: '#666',
        fontSize: 11,
        flex: 1,
    },
});
