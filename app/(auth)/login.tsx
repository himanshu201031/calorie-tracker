import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter, Link } from "expo-router";
import { signIn } from "../../src/services/authService";
import { useAuthStore } from "../../src/store/authStore";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { isLoading, error, setError, setLoading } = useAuthStore();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        setLoading(true);
        try {
            await signIn(email, password);
            // Auth listener in _layout will handle redirection
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back</Text>

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

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Login</Text>
                )}
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <Link href="/signup" asChild>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>Sign Up</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            <Link href="/forgot-password" asChild>
                <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.footerText}>Forgot Password?</Text>
                </TouchableOpacity>
            </Link>
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
        marginBottom: 32,
        textAlign: "center",
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
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 24,
    },
    footerText: {
        color: "#666",
        fontSize: 14,
    },
    linkText: {
        color: "#7C5CFF",
        fontSize: 14,
        fontWeight: "600",
    },
    forgotPassword: {
        alignItems: "center",
        marginTop: 16,
    },
});
