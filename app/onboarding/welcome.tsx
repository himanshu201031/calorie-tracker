import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Utensils } from 'lucide-react-native';

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Utensils size={64} color="#7C5CFF" />
                </View>
                <Text style={styles.title}>Welcome to AI Calories</Text>
                <Text style={styles.subtitle}>
                    Track your nutrition effortlessly with the power of AI. Let's get you set up!
                </Text>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/onboarding/details')}
            >
                <LinearGradient
                    colors={['#7C5CFF', '#A78BFA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F0F',
        padding: 24,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        color: '#999',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 20,
    },
    button: {
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 'auto',
        marginBottom: 20,
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
