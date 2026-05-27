import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const fallbackConfig = {
  apiKey: "AIzaSyDgSFtgwcTDwvOzntael16Ys_mtp-pEyMw",
  authDomain: "akpconsulting-dafe9.firebaseapp.com",
  projectId: "akpconsulting-dafe9",
  storageBucket: "akpconsulting-dafe9.appspot.com",
  messagingSenderId: "327216395688",
  appId: "1:327216395688:web:46e91b362b7c81106cd99d",
  measurementId: "G-BNDG2XG2HX",
};

const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasEnvConfig = Boolean(
  envConfig.apiKey &&
  envConfig.authDomain &&
  envConfig.projectId &&
  envConfig.storageBucket &&
  envConfig.messagingSenderId &&
  envConfig.appId
);

const firebaseConfig = hasEnvConfig ? envConfig : fallbackConfig;

export const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

const app = isConfigured ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

export const analytics = app
  ? isSupported()
      .then((yes) => (yes ? getAnalytics(app) : null))
      .catch(() => null)
  : Promise.resolve(null);
