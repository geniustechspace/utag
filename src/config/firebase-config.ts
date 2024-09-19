import { getApps, initializeApp, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC5NJVvcEtC2flswEaGLhOwsRc7r_arNAc",
    authDomain: "fb-test-project-360.firebaseapp.com",
    projectId: "fb-test-project-360",
    storageBucket: "fb-test-project-360.appspot.com",
    messagingSenderId: "895832607248",
    appId: "1:895832607248:web:c7ba05fa56948239e11895",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
