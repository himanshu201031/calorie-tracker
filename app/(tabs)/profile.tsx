import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { User, LogOut, Settings, ChevronRight, Award } from "lucide-react-native";
import { useAuthStore } from "../../src/store/authStore";
import { signOut } from "../../src/services/authService";
import { getUserProfile, UserProfile } from "../../src/services/userService";

export default function ProfileScreen() {
    const router = useRouter();
    const { user, setUser } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            if (user) {
                try {
                    const data = await getUserProfile(user.uid);
                    setProfile(data);
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            }
            setLoading(false);
        }
        fetchProfile();
    }, [user]);

    const handleLogout = async () => {
        try {
            await signOut();
            setUser(null);
        } catch (error) {
            Alert.alert("Error", "Failed to log out.");
        }
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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Profile</Text>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push('/settings')}
                    >
                        <Settings size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <User size={60} color="#7C5CFF" />
                    </View>
                    <Text style={styles.userName}>{profile?.name || 'User'}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{profile?.weight || '--'}</Text>
                        <Text style={styles.statLab}>Weight (kg)</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{profile?.height || '--'}</Text>
                        <Text style={styles.statLab}>Height (cm)</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{profile?.calorieTarget || '--'}</Text>
                        <Text style={styles.statLab}>Kcal Goal</Text>
                    </View>
                </View>

                <View style={styles.menuSection}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/achievements')}
                    >
                        <View style={styles.menuIcon}>
                            <Award size={20} color="#FACC15" />
                        </View>
                        <Text style={styles.menuText}>Your Achievements</Text>
                        <ChevronRight size={20} color="#444" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, styles.logoutItem]}
                        onPress={handleLogout}
                    >
                        <View style={[styles.menuIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                            <LogOut size={20} color="#EF4444" />
                        </View>
                        <Text style={[styles.menuText, { color: '#EF4444' }]}>Log Out</Text>
                        <ChevronRight size={20} color="#444" />
                    </TouchableOpacity>
                </View>
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
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#7C5CFF',
        marginBottom: 16,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statVal: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLab: {
        fontSize: 12,
        color: '#666',
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: '#333',
    },
    menuSection: {
        gap: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        padding: 16,
        borderRadius: 16,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(124, 92, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuText: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutItem: {
        marginTop: 8,
    },
});
