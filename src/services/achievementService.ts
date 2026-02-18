import { collection, query, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: string;
    progress: number; // 0 to 1
    target: number;
    category: 'meals' | 'streak' | 'water' | 'weight';
}

const ACHIEVEMENTS_LIST: Achievement[] = [
    {
        id: 'first_meal',
        title: 'Novice Logger',
        description: 'Log your first meal to start your journey.',
        icon: 'utensils',
        progress: 0,
        target: 1,
        category: 'meals'
    },
    {
        id: 'streak_7',
        title: 'Dedicated',
        description: 'Maintain a 7-day meal logging streak.',
        icon: 'flame',
        progress: 0,
        target: 7,
        category: 'streak'
    },
    {
        id: 'water_3',
        title: 'Water Wizard',
        description: 'Meet your hydration goal for 3 days.',
        icon: 'droplet',
        progress: 0,
        target: 3,
        category: 'water'
    },
    {
        id: 'calorie_goal_5',
        title: 'Calorie Conscious',
        description: 'Stay within your calorie goal for 5 days.',
        icon: 'target',
        progress: 0,
        target: 5,
        category: 'meals'
    }
];

export const getAchievements = async (userId: string): Promise<Achievement[]> => {
    const achievementsRef = collection(db, 'users', userId, 'achievements');
    const querySnapshot = await getDocs(achievementsRef);

    const unlocked: { [key: string]: any } = {};
    querySnapshot.docs.forEach(doc => {
        unlocked[doc.id] = doc.data();
    });

    return ACHIEVEMENTS_LIST.map(a => ({
        ...a,
        unlockedAt: unlocked[a.id]?.unlockedAt,
        progress: unlocked[a.id]?.progress || 0
    }));
};

export const updateAchievementProgress = async (userId: string, achievementId: string, progress: number) => {
    const achievement = ACHIEVEMENTS_LIST.find(a => a.id === achievementId);
    if (!achievement) return;

    const achievementRef = doc(db, 'users', userId, 'achievements', achievementId);
    const data: any = {
        progress: Math.min(progress, achievement.target),
        lastUpdated: new Date().toISOString()
    };

    if (progress >= achievement.target) {
        data.unlockedAt = new Date().toISOString();
    }

    await setDoc(achievementRef, data, { merge: true });
};
