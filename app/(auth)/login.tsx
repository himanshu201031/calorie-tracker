import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter, Link } from "expo-router";
import { signIn, signInWithGoogle } from "../../src/services/authService";
import { useAuthStore } from "../../src/store/authStore";
import { Chrome as Google, Phone } from "lucide-react-native";

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
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back</Text>

            {error && <View style={styles.errorContainer}><Text style={styles.errorText}>{error}</Text></View>}

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

            <Link href="/forgot-password" asChild>
                <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
            </Link>

            <View style={styles.separatorContainer}>
                <View style={styles.line} />
                <Text style={styles.separatorText}>OR</Text>
                <View style={styles.line} />
            </View>

            <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleLogin}
                disabled={isLoading}
            >
                <Google color="#fff" size={20} style={styles.socialIcon} />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <Link href="/(auth)/phone-login" asChild>
                <TouchableOpacity
                    style={styles.socialButton}
                    disabled={isLoading}
                >
                    <Phone color="#fff" size={20} style={styles.socialIcon} />
                    <Text style={styles.socialButtonText}>Continue with Phone</Text>
                </TouchableOpacity>
            </Link>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <Link href="/signup" asChild>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>Sign Up</Text>
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
        fontSize: 32,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 32,
        textAlign: "left",
    },
    errorContainer: {
        backgroundColor: "rgba(255, 77, 77, 0.1)",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
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
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#333",
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
    forgotPassword: {
        alignItems: "center",
        marginTop: 16,
    },
    forgotPasswordText: {
        color: "#7C5CFF",
        fontSize: 14,
    },
    separatorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 32,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#333",
    },
    separatorText: {
        color: "#666",
        marginHorizontal: 16,
        fontSize: 14,
        fontWeight: "600",
    },
    socialButton: {
        flexDirection: "row",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    socialIcon: {
        marginRight: 12,
    },
    socialButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
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
});
