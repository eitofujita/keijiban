import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export type Community = {
  slug: string;
  name?: string;
  iconUrl?: string;
};

export function useJoinedCommunities(uid?: string | null) {
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    if (!uid) {
      setCommunities([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "communities"),
      where("memberIds", "array-contains", uid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Community[] = [];
        snap.forEach((doc) => {
          const d = doc.data() as any;
          list.push({
            slug: d.slug ?? doc.id,
            name: d.name,
            iconUrl: d.iconUrl,
          });
        });
        setCommunities(list);
        setLoading(false);
      },
      (err) => {
        console.error("useJoinedCommunities error:", err);
        setCommunities([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid]);

  return { loading, communities };
}
