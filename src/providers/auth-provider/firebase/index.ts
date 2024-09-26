import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInAnonymously,
    GoogleAuthProvider,
    signInWithPopup,
    User,
    signOut,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";

import { auth } from "@/config/firebase-config";

export const signUpWithEmail = async ({
    email,
    password,
}: {
    email: string;
    password: string;
}): Promise<User | unknown> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password,
        );

        return userCredential.user;
    } catch (error) {
        throw error;
    }
};

export const loginWithEmail = async ({
    email,
    password,
}: {
    email: string;
    password: string;
}): Promise<User | unknown> => {
    try {
        const authResult = await signInWithEmailAndPassword(
            auth,
            email,
            password,
        );

        return authResult.user;
    } catch (error) {
        throw error;
    }
};

export const loginAnonymously = async (): Promise<User | unknown> => {
    try {
        const authResult = await signInAnonymously(auth);

        return authResult.user;
    } catch (error) {
        throw error;
    }
};

export const loginWithGoogle = async (): Promise<User | unknown> => {
    try {
        const provider = new GoogleAuthProvider();
        // await signInWithRedirect(auth, provider);

        // const authResult = await getRedirectResult(auth);
        // console.log("User:", authResult!.user);
        // return authResult!.user;

        const authResult = await signInWithPopup(auth, provider);

        return authResult.user;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const logOut = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error) {
        throw error;
    }
};

export const handleAuthErrors = (
    error: unknown,
    setErrors: (errorMessage: string) => void,
) => {
    if (error instanceof FirebaseError) {
        // Extract the error message using regex
        const match = error.message.match(/: (.*?)(?=\()/);
        let errorMessage = match
            ? match[1].trim()
            : "Something went wrong... please try again!";

        // Check if the extracted error message is too short
        if (errorMessage.length < 9) {
            // Use the error code to generate a more descriptive error message
            errorMessage = error.code.substring(5).replace(/-/g, " ");
        }

        setErrors(errorMessage);
    } else {
        setErrors("Something went wrong... please try again!");
    }
};
