import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { updateAchievementProgress } from './achievementService';
import { UserProfile } from './userService';

export const updateStreak = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) return;

    const profile = docSnap.data() as UserProfile;
    const today = new Date().toISOString().split('T')[0];

    if (profile.lastLogDate === today) {
        // Already logged today, streak remains same
        return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;

    if (profile.lastLogDate === yesterdayStr) {
        newStreak = (profile.currentStreak || 0) + 1;
    }

    await updateDoc(userRef, {
        currentStreak: newStreak,
        lastLogDate: today
    });

    await updateAchievementProgress(userId, 'streak_7', newStreak);
};
