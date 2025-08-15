// src/hooks/useModeratedCommunities.ts
import { useEffect, useState, useCallback } from "react";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export type ModCommunity = {
  id: string;
  slug: string;
  name?: string;
  iconUrl?: string;
};

export function useModeratedCommunities(uid?: string | null) {
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState<ModCommunity[]>([]);

  const fetchCommunities = useCallback(async () => {
    if (!uid) {
      setCommunities([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const q = query(
      collection(db, "communities"),
      where("moderatorIds", "array-contains", uid)
    );
    const snap = await getDocs(q);
    const list: ModCommunity[] = snap.docs.map((doc) => {
      const d = doc.data() as any;
      return {
        id: doc.id,
        slug: d.slug ?? doc.id,
        name: d.displayName,
        iconUrl: d.iconUrl,
      };
    });
    setCommunities(list);
    setLoading(false);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "communities"),
      where("moderatorIds", "array-contains", uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: ModCommunity[] = snap.docs.map((doc) => {
        const d = doc.data() as any;
        return {
          id: doc.id,
          slug: d.slug ?? doc.id,
          name: d.displayName,
          iconUrl: d.iconUrl,
        };
      });
      setCommunities(list);
      setLoading(false);
    });

    return () => unsub();
  }, [uid]);

  return { loading, communities, refetch: fetchCommunities };
}

export default useModeratedCommunities;
