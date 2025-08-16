import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase"; // ← db を追加
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // ← Firestore の関数を追加
import type { User } from "firebase/auth";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        // ✅ Firestore にユーザー情報を保存（または更新）
        const userRef = doc(db, "users", user.uid);
        await setDoc(
          userRef,
          {
            displayName: user.displayName || "",
            avatarUrl: user.photoURL || "",
            email: user.email || "",
            updatedAt: serverTimestamp(),
          },
          { merge: true } // ← 既存のフィールドを上書きしない
        );
      }
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};
