import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dashboard Placeholder</Text>
            <Text style={styles.subtitle}>Welcome to AI Calories App!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F0F0F",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "700",
    },
    subtitle: {
        color: "#666",
        fontSize: 16,
        marginTop: 8,
    },
});
