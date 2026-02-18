import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface Meal {
    id?: string;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    imageUrl?: string;
    source: 'AI' | 'manual';
    createdAt: string;
    date: string; // YYYY-MM-DD
}

export const logMeal = async (userId: string, meal: Omit<Meal, 'id'>) => {
    const mealsRef = collection(db, 'users', userId, 'meals');
    return await addDoc(mealsRef, meal);
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
