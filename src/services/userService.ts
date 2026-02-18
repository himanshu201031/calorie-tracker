import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    age: number;
    weight: number;
    height: number;
    gender: string;
    activityLevel: string;
    goal: string;
    calorieTarget: number;
    onboardingComplete: boolean;
    createdAt: string;
}

export const createUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', uid);
    const profileData = {
        ...data,
        uid,
        createdAt: new Date().toISOString(),
    };
    await setDoc(userRef, profileData, { merge: true });
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    }
    return null;
};

export const updateOnboardingStatus = async (uid: string, complete: boolean) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { onboardingComplete: complete });
};
