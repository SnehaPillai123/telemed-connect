import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDdDQ31fULX7qBzhv8eIW44IUWBZz9IM1o",
  authDomain: "telemed-connect-6e817.firebaseapp.com",
  projectId: "telemed-connect-6e817",
  storageBucket: "telemed-connect-6e817.firebasestorage.app",
  messagingSenderId: "148297093284",
  appId: "1:148297093284:web:aac5e8630990b9deb61631"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
