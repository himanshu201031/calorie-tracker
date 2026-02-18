import { Tabs } from "expo-router";
import { Home, Flame, Clock, User } from "lucide-react-native";
import { Platform, View } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 24,
                    left: 20,
                    right: 20,
                    backgroundColor: "rgba(26, 26, 26, 0.95)",
                    borderRadius: 32,
                    height: 64,
                    borderTopWidth: 0,
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    paddingBottom: Platform.OS === 'ios' ? 0 : 0,
                },
                tabBarShowLabel: false,
                tabBarActiveTintColor: "#FFF",
                tabBarInactiveTintColor: "#666",
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabIcon, focused && styles.activeTab]}>
                            <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: "Scan",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabIcon, focused && styles.activeTab]}>
                            <Flame size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: "History",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabIcon, focused && styles.activeTab]}>
                            <Clock size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabIcon, focused && styles.activeTab]}>
                            <User size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = {
    tabIcon: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
    },
    activeTab: {
        backgroundColor: '#7C5CFF',
    },
};
