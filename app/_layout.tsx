import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useAuthStore } from "../src/store/authStore";
import { listenToAuthState } from "../src/services/authService";
import { getUserProfile, UserProfile } from "../src/services/userService";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const { user, setUser, isLoading, setLoading } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isInitialCheck, setIsInitialCheck] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = listenToAuthState(async (user) => {
      setUser(user);
      if (user) {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setIsInitialCheck(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isLoading || isInitialCheck) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "onboarding";

    if (!user) {
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else if (!profile || !profile.onboardingComplete) {
      if (!inOnboardingGroup) {
        router.replace("/onboarding/welcome");
      }
    } else if (inAuthGroup || inOnboardingGroup) {
      router.replace("/(tabs)");
    }
  }, [user, profile, segments, isLoading, isInitialCheck]);

  if (isLoading || isInitialCheck) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0F0F0F" }}>
        <ActivityIndicator size="large" color="#7C5CFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
