import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDgSFtgwcTDwvOzntael16Ys_mtp-pEyMw",
  authDomain: "akpconsulting-dafe9.firebaseapp.com",
  projectId: "akpconsulting-dafe9",
  storageBucket: "akpconsulting-dafe9.appspot.com",
  messagingSenderId: "327216395688",
  appId: "1:327216395688:web:46e91b362b7c81106cd99d",
  measurementId: "G-BNDG2XG2HX"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const analytics = isSupported()
  .then((yes) => (yes ? getAnalytics(app) : null))
  .catch(() => null);
