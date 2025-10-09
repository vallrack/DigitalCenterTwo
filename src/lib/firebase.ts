// /src/lib/firebase.ts
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { 
    getAuth, 
    GoogleAuthProvider, 
    OAuthProvider 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAM8e_65MeZkqDXNQZGfCt31_IIdis70RM",
  authDomain: "digitarcenter-nuevo.firebaseapp.com",
  projectId: "digitarcenter-nuevo",
  storageBucket: "digitarcenter-nuevo.appspot.com",
  messagingSenderId: "744743047309",
  appId: "1:744743047309:web:30d930100cd50e150412c4",
  measurementId: "G-WBYNB8WGZK"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

// Export providers for easy access
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
