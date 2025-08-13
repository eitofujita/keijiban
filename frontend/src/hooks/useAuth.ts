import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import type { User } from "firebase/auth";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);       // ユーザー情報
  const [loading, setLoading] = useState(true);              // ローディング状態を追加

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false); // ロード完了
    });

    return unsubscribe; // クリーンアップ
  }, []);

  return { user, loading }; // オブジェクトで返す（←重要）
};
