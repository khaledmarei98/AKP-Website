import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
   apiKey: "AIzaSyDgSFtgwcTDwvOzntael16Ys_mtp-pEyMw",
  authDomain: "akpconsulting-dafe9.firebaseapp.com",
  projectId: "akpconsulting-dafe9",
  storageBucket: "akpconsulting-dafe9.firebasestorage.app",
  messagingSenderId: "327216395688",
  appId: "1:327216395688:web:46e91b362b7c81106cd99d",
  measurementId: "G-BNDG2XG2HX"
};
export const isConfigured = Object.entries(firebaseConfig)
  .filter(([key]) => key !== "measurementId")
  .every(([, v]) => Boolean(v));

const app =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

export const analytics = app
  ? isSupported().then((yes) => (yes ? getAnalytics(app) : null)).catch(() => null)
  : Promise.resolve(null);
