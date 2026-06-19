import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDgSFtgwcTDwvOzntael16Ys_mtp-pEyMw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "akpconsulting-dafe9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "akpconsulting-dafe9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "akpconsulting-dafe9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "327216395688",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:327216395688:web:46e91b362b7c81106cd99d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BNDG2XG2HX",
};

export const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

export const analytics = app
  ? isSupported()
      .then((yes) => (yes ? getAnalytics(app) : null))
      .catch(() => null)
  : Promise.resolve(null);
