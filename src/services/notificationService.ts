import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const requestNotificationPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    return finalStatus === 'granted';
};

export const scheduleDailyReminders = async () => {
    // Clear existing
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Breakfast (8:30 AM)
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Breakfast Time! 🍳",
            body: "Don't forget to log your breakfast to stay on track.",
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 8,
            minute: 30,
        },
    });

    // Lunch (1:30 PM)
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Lunch Reminder 🥗",
            body: "Log your lunch calories for accurate daily tracking.",
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 13,
            minute: 30,
        },
    });

    // Dinner (7:30 PM)
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Dinner is Served 🍲",
            body: "How was your dinner? Log it now to close your day.",
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 19,
            minute: 30,
        },
    });

    // Hydration (Every 3 hours between 10 AM and 10 PM)
    const hydrationHours = [10, 13, 16, 19, 22];
    for (const hour of hydrationHours) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Stay Hydrated 💧",
                body: "Time for a glass of water to keep your metabolism active.",
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: hour,
                minute: 0,
            },
        });
    }
};
