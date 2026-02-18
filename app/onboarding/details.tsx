import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/src/store/authStore';
import { createUserProfile } from '@/src/services/userService';

export default function DetailsScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        weight: '',
        height: '',
        gender: 'male',
        activityLevel: 'moderate',
        goal: 'maintain',
    });

    const handleSubmit = async () => {
        if (!user) return;

        const { name, age, weight, height } = formData;
        if (!name || !age || !weight || !height) {
            Alert.alert('Missing Info', 'Please fill in all fields to calculate your targets.');
            return;
        }

        try {
            // Calorie calculation logic (Mifflin-St Jeor)
            const w = parseFloat(weight);
            const h = parseFloat(height);
            const a = parseInt(age);
            let bmr = 0;

            if (formData.gender === 'male') {
                bmr = 10 * w + 6.25 * h - 5 * a + 5;
            } else {
                bmr = 10 * w + 6.25 * h - 5 * a - 161;
            }

            const activityFactors: Record<string, number> = {
                sedentary: 1.2,
                light: 1.375,
                moderate: 1.55,
                active: 1.725,
                very_active: 1.9,
            };

            const tdee = bmr * activityFactors[formData.activityLevel];

            let calorieTarget = tdee;
            if (formData.goal === 'lose') calorieTarget -= 500;
            if (formData.goal === 'gain') calorieTarget += 500;

            await createUserProfile(user.uid, {
                ...formData,
                age: a,
                weight: w,
                height: h,
                calorieTarget: Math.round(calorieTarget),
                onboardingComplete: true,
            });

            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'Failed to save your profile. Please try again.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Your Details</Text>
                <Text style={styles.subtitle}>Tell us about yourself to personalize your experience.</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor="#666"
                        value={formData.name}
                        onChangeText={(v) => setFormData(p => ({ ...p, name: v }))}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Age</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="25"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            value={formData.age}
                            onChangeText={(v) => setFormData(p => ({ ...p, age: v }))}
                        />
                    </View>
                    <View style={{ width: 20 }} />
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Weight (kg)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="70"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            value={formData.weight}
                            onChangeText={(v) => setFormData(p => ({ ...p, weight: v }))}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Height (cm)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="175"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        value={formData.height}
                        onChangeText={(v) => setFormData(p => ({ ...p, height: v }))}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Goal</Text>
                    <View style={styles.radioGroup}>
                        {['lose', 'maintain', 'gain'].map((g) => (
                            <TouchableOpacity
                                key={g}
                                style={[styles.radioButton, formData.goal === g && styles.radioActive]}
                                onPress={() => setFormData(p => ({ ...p, goal: g }))}
                            >
                                <Text style={[styles.radioText, formData.goal === g && styles.radioTextActive]}>
                                    {g.charAt(0).toUpperCase() + g.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                >
                    <LinearGradient
                        colors={['#7C5CFF', '#A78BFA']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    >
                        <Text style={styles.buttonText}>Complete Setup</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F0F',
    },
    scrollContent: {
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#999',
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        height: 52,
        paddingHorizontal: 16,
        color: '#FFFFFF',
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 12,
    },
    radioButton: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    radioActive: {
        borderColor: '#7C5CFF',
        backgroundColor: 'rgba(124, 92, 255, 0.1)',
    },
    radioText: {
        color: '#666',
        fontWeight: '600',
    },
    radioTextActive: {
        color: '#7C5CFF',
    },
    button: {
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 20,
        marginBottom: 40,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
