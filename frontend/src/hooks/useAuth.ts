import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // ✅ ← loading ステート追加

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false); // ✅ ← ユーザー状態が判明したら false に
    });

    return unsubscribe;
  }, []);

  return { user, loading }; // ✅ オブジェクトで返すように変更
};
