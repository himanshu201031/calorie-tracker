import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { Link } from "expo-router";
import { resetPassword } from "../../src/services/authService";
import { useAuthStore } from "../../src/store/authStore";

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState("");
    const { isLoading, error, setError, setLoading } = useAuthStore();

    const handleReset = async () => {
        if (!email) {
            setError("Please enter your email.");
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email);
            Alert.alert("Success", "Password reset email sent!");
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>

            <Text style={styles.subtitle}>
                Enter your email and we'll send you a link to reset your password.
            </Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleReset}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Send Link</Text>
                )}
            </TouchableOpacity>

            <View style={styles.footer}>
                <Link href="/login" asChild>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>Back to Login</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F0F0F",
        padding: 24,
        justifyContent: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 12,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 32,
        textAlign: "center",
        lineHeight: 22,
    },
    input: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        color: "#fff",
        marginBottom: 16,
        fontSize: 16,
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
    errorText: {
        color: "#FF4D4D",
        marginBottom: 16,
        textAlign: "center",
    },
    footer: {
        alignItems: "center",
        marginTop: 24,
    },
    linkText: {
        color: "#7C5CFF",
        fontSize: 14,
        fontWeight: "600",
    },
});
