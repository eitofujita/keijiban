// src/hooks/useModeratedCommunities.ts
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export type ModCommunity = {
  slug: string;
  name?: string;
  iconUrl?: string;
};

export function useModeratedCommunities(uid?: string | null) {
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState<ModCommunity[]>([]);

  useEffect(() => {
    if (!uid) {
      setCommunities([]);
      setLoading(false);
      return;
    }

    // 期待スキーマ:
    // communities コレクションの各ドキュメントに
    //   - slug: string
    //   - iconUrl?: string
    //   - moderatorIds: string[]  // ← ここにモデレーターの uid を格納
    const q = query(
      collection(db, "communities"),
      where("moderatorIds", "array-contains", uid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: ModCommunity[] = [];
        snap.forEach((doc) => {
          const d = doc.data() as any;
          list.push({
            slug: d.slug ?? doc.id,
            name: d.displayName,
            iconUrl: d.iconUrl,
          });
        });
        setCommunities(list);
        setLoading(false);
      },
      (err) => {
        console.error("useModeratedCommunities error:", err);
        setCommunities([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid]);

  return { loading, communities };
}

export default useModeratedCommunities;
