import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { signOut } from "../../src/services/authService";
import { useAuthStore } from "../../src/store/authStore";

export default function ProfileScreen() {
    const { user } = useAuthStore();

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.email}>{user?.email}</Text>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F0F0F",
        padding: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8,
    },
    email: {
        color: "#666",
        fontSize: 16,
        marginBottom: 40,
    },
    logoutButton: {
        backgroundColor: "#FF4D4D",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    logoutText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
