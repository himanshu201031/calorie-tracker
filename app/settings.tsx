import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Save } from "lucide-react-native";
import { useAuthStore } from "../src/store/authStore";
import { getUserProfile, updateUserProfile, UserProfile } from "../src/services/userService";

export default function SettingsScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [target, setTarget] = useState("");
    const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

    useEffect(() => {
        async function fetchProfile() {
            if (user) {
                const data = await getUserProfile(user.uid);
                if (data) {
                    setProfile(data);
                    setName(data.name || "");
                    setWeight(data.weight.toString());
                    setHeight(data.height.toString());
                    setTarget(data.calorieTarget.toString());
                    setUnits(data.units || 'metric');
                }
            }
            setLoading(false);
        }
        fetchProfile();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await updateUserProfile(user.uid, {
                name,
                weight: parseFloat(weight),
                height: parseFloat(height),
                calorieTarget: parseInt(target),
                units
            });
            Alert.alert("Success", "Profile updated successfully!");
            router.back();
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "Failed to update profile.");
        } finally {
            setSaving(false);
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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Settings</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    style={[styles.saveButton, saving && { opacity: 0.5 }]}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Save size={24} color="#FFF" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Profile Information</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor="#444"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Body Metrics</Text>
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Weight ({units === 'metric' ? 'kg' : 'lbs'})</Text>
                            <TextInput
                                style={styles.input}
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor="#444"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Height ({units === 'metric' ? 'cm' : 'in'})</Text>
                            <TextInput
                                style={styles.input}
                                value={height}
                                onChangeText={setHeight}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor="#444"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Goals</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Daily Calorie Target</Text>
                        <TextInput
                            style={styles.input}
                            value={target}
                            onChangeText={setTarget}
                            keyboardType="numeric"
                            placeholder="2000"
                            placeholderTextColor="#444"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <Text style={styles.label}>Unit System</Text>
                    <View style={styles.unitToggle}>
                        <TouchableOpacity
                            style={[styles.unitButton, units === 'metric' && styles.unitButtonActive]}
                            onPress={() => setUnits('metric')}
                        >
                            <Text style={[styles.unitButtonText, units === 'metric' && styles.unitButtonTextActive]}>Metric</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.unitButton, units === 'imperial' && styles.unitButtonActive]}
                            onPress={() => setUnits('imperial')}
                        >
                            <Text style={[styles.unitButtonText, units === 'imperial' && styles.unitButtonTextActive]}>Imperial</Text>
                        </TouchableOpacity>
                    </View>
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#7C5CFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    scrollContent: {
        padding: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#7C5CFF',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        color: '#FFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    unitToggle: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 4,
        marginTop: 8,
    },
    unitButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    unitButtonActive: {
        backgroundColor: '#7C5CFF',
    },
    unitButtonText: {
        color: '#666',
        fontWeight: 'bold',
    },
    unitButtonTextActive: {
        color: '#FFF',
    },
});
