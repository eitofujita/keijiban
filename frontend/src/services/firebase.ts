// frontend/src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ← Firestore を追加

const firebaseConfig = {
  apiKey: "AIzaSyA46__hl90RSnjMHfmJj6ZQsYfnD8gAQZE",
  authDomain: "eddit-32f49.firebaseapp.com",
  projectId: "eddit-32f49",
  storageBucket: "eddit-32f49.firebasestorage.app",
  messagingSenderId: "266216274649",
  appId: "1:266216274649:web:159a37a3ee091993605cc8",
  measurementId: "G-02L340KW54",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app); // ← Firestore を初期化して追加
