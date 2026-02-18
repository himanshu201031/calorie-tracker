import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { sendOTP, verifyOTP } from '../../src/services/authService';
import { useAuthStore } from '../../src/store/authStore';
import { ArrowLeft, Smartphone } from 'lucide-react-native';

export default function PhoneLoginScreen() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'NUMBER' | 'OTP'>('NUMBER');
    const { isLoading, error, setError, setLoading } = useAuthStore();
    const router = useRouter();

    const handleSendOTP = async () => {
        if (!phoneNumber) {
            setError("Please enter your phone number.");
            return;
        }

        setLoading(true);
        try {
            // Note: In a real Expo app, you'd need a RecaptchaVerifier.
            // For now, we'll assume the service handles the native/web distinction.
            // On web, it needs a DOM element ID. On Native, it's more complex.
            // I'll provide a dummy object for now or handle it in the service if possible.
            await sendOTP(phoneNumber, null);
            setStep('OTP');
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            setError("Please enter the OTP.");
            return;
        }

        setLoading(true);
        try {
            await verifyOTP(otp);
            // Navigation handled by root layout
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>

            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Smartphone color="#7C5CFF" size={32} />
                </View>
                <Text style={styles.title}>
                    {step === 'NUMBER' ? 'Phone Login' : 'Verify OTP'}
                </Text>
                <Text style={styles.subtitle}>
                    {step === 'NUMBER'
                        ? 'Enter your phone number to receive a verification code.'
                        : `We've sent a code to ${phoneNumber}`}
                </Text>
            </View>

            {error && <View style={styles.errorContainer}><Text style={styles.errorText}>{error}</Text></View>}

            {step === 'NUMBER' ? (
                <View>
                    <TextInput
                        style={styles.input}
                        placeholder="+1 123 456 7890"
                        placeholderTextColor="#666"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        autoFocus
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSendOTP}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Send Code</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <View>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter 6-digit code"
                        placeholderTextColor="#666"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoFocus
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleVerifyOTP}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Verify & Login</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setStep('NUMBER')}
                        style={styles.resendButton}
                    >
                        <Text style={styles.resendText}>Edit phone number?</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F0F0F",
        padding: 24,
    },
    backButton: {
        marginTop: 20,
        marginBottom: 40,
    },
    header: {
        marginBottom: 32,
    },
    iconContainer: {
        width: 64,
        height: 64,
        backgroundColor: "rgba(124, 92, 255, 0.1)",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        lineHeight: 24,
    },
    errorContainer: {
        backgroundColor: "rgba(255, 77, 77, 0.1)",
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(255, 77, 77, 0.3)",
    },
    errorText: {
        color: "#FF4D4D",
        fontSize: 14,
        textAlign: "center",
    },
    input: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        color: "#fff",
        marginBottom: 16,
        fontSize: 18,
        borderWidth: 1,
        borderColor: "#333",
        textAlign: "center",
        letterSpacing: 2,
    },
    button: {
        backgroundColor: "#7C5CFF",
        borderRadius: 12,
        padding: 18,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    resendButton: {
        marginTop: 24,
        alignItems: "center",
    },
    resendText: {
        color: "#7C5CFF",
        fontSize: 14,
    },
});
