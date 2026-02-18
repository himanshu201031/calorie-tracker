import { collection, addDoc, query, where, getDocs, orderBy, limit, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { getAchievements, updateAchievementProgress } from './achievementService';

export interface WaterLog {
    amount: number; // in ml
    date: string; // YYYY-MM-DD
    updatedAt: string;
}

export const logWater = async (userId: string, amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    const waterRef = doc(db, 'users', userId, 'water', today);

    // Check if exists
    const querySnapshot = await getDocs(query(collection(db, 'users', userId, 'water'), where('date', '==', today)));

    if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const currentAmount = docSnap.data().amount || 0;
        const newAmount = currentAmount + amount;
        await updateDoc(docSnap.ref, {
            amount: newAmount,
            updatedAt: new Date().toISOString()
        });

        if (newAmount >= 2000 && currentAmount < 2000) {
            const achievements = await getAchievements(userId);
            const waterAchievement = achievements.find(a => a.id === 'water_3');
            if (waterAchievement) {
                await updateAchievementProgress(userId, 'water_3', (waterAchievement.progress || 0) + 1);
            }
        }
    } else {
        await setDoc(waterRef, {
            amount: amount,
            date: today,
            updatedAt: new Date().toISOString()
        });
        if (amount >= 2000) {
            await updateAchievementProgress(userId, 'water_3', 1);
        }
    }
};

export const getDailyWater = async (userId: string, date: string): Promise<number> => {
    const waterRef = collection(db, 'users', userId, 'water');
    const q = query(waterRef, where('date', '==', date));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return 0;
    return querySnapshot.docs[0].data().amount || 0;
};

export const getWeeklyWater = async (userId: string): Promise<{ date: string, amount: number }[]> => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    const waterRef = collection(db, 'users', userId, 'water');
    const q = query(waterRef, where('date', 'in', days));
    const querySnapshot = await getDocs(q);

    const dailyTotals: { [key: string]: number } = {};
    days.forEach(d => dailyTotals[d] = 0);

    querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        dailyTotals[data.date] = data.amount || 0;
    });

    return days.map(date => ({
        date,
        amount: dailyTotals[date]
    }));
};
