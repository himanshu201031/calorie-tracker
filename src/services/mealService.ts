import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { updateStreak } from './streakService';
import { updateAchievementProgress } from './achievementService';

export interface Meal {
    id?: string;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    imageUrl?: string;
    source: 'AI' | 'manual';
    category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    createdAt: string;
    date: string; // YYYY-MM-DD
}

export const logMeal = async (userId: string, meal: Omit<Meal, 'id'>) => {
    const mealsRef = collection(db, 'users', userId, 'meals');
    const result = await addDoc(mealsRef, meal);
    await updateStreak(userId);
    await updateAchievementProgress(userId, 'first_meal', 1);
    return result;
};

export const getDailyMeals = async (userId: string, date: string): Promise<Meal[]> => {
    const mealsRef = collection(db, 'users', userId, 'meals');
    const q = query(
        mealsRef,
        where('date', '==', date),
        orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Meal));
};

export const getAllMeals = async (userId: string): Promise<Meal[]> => {
    const mealsRef = collection(db, 'users', userId, 'meals');
    const q = query(
        mealsRef,
        orderBy('date', 'desc'),
        orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Meal));
};

export const deleteMeal = async (userId: string, mealId: string) => {
    const mealRef = doc(db, 'users', userId, 'meals', mealId);
    await deleteDoc(mealRef);
};

export const getWeeklyMeals = async (userId: string): Promise<{ date: string, calories: number }[]> => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    const mealsRef = collection(db, 'users', userId, 'meals');
    const q = query(
        mealsRef,
        where('date', 'in', days)
    );

    const querySnapshot = await getDocs(q);
    const dailyTotals: { [key: string]: number } = {};
    days.forEach(d => dailyTotals[d] = 0);

    querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        dailyTotals[data.date] = (dailyTotals[data.date] || 0) + data.calories;
    });

    return days.map(date => ({
        date,
        calories: dailyTotals[date]
    }));
};

export const getWeeklyMealDetails = async (userId: string): Promise<Meal[]> => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    const mealsRef = collection(db, 'users', userId, 'meals');
    const q = query(
        mealsRef,
        where('date', 'in', days)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Meal));
};
