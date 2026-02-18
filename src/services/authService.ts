import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    User,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    ConfirmationResult
} from "firebase/auth";
import { auth } from "./firebaseConfig";

const translateError = (error: any) => {
    const code = error.code || error.message;
    if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password') || code.includes('auth/user-not-found')) {
        return "Invalid email or password. Please check your credentials.";
    }
    if (code.includes('auth/network-request-failed')) {
        return "Network error. Please check your connection.";
    }
    if (code.includes('auth/email-already-in-use')) {
        return "This email is already registered.";
    }
    if (code.includes('auth/weak-password')) {
        return "Password should be at least 6 characters.";
    }
    return error.message || "An unexpected error occurred.";
};

export const signUp = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: any) {
        throw new Error(translateError(error));
    }
};

export const signIn = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: any) {
        throw new Error(translateError(error));
    }
};

export const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        return userCredential.user;
    } catch (error: any) {
        throw new Error(translateError(error));
    }
};

let confirmationResult: ConfirmationResult | null = null;

export const sendOTP = async (phoneNumber: string, recaptchaVerifier: any) => {
    try {
        confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
        return confirmationResult;
    } catch (error: any) {
        throw new Error(translateError(error));
    }
};

export const verifyOTP = async (code: string) => {
    try {
        if (!confirmationResult) {
            throw new Error("No pending verification found.");
        }
        const userCredential = await confirmationResult.confirm(code);
        return userCredential.user;
    } catch (error: any) {
        throw new Error(translateError(error));
    }
};

export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error: any) {
        throw new Error(translateError(error));
    }
};

export const resetPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        throw new Error(translateError(error));
    }
};

export const listenToAuthState = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};
