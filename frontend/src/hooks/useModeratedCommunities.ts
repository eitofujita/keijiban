// src/hooks/useModeratedCommunities.ts
import { useEffect, useState, useCallback } from "react";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export type ModCommunity = {
  id: string;
  slug: string;
  name?: string;
  iconUrl?: string;
  hostId?: string;
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

    // ホストしているコミュニティを取得
    const hostQuery = query(
      collection(db, "communities"),
      where("hostId", "==", uid)
    );
    const hostSnap = await getDocs(hostQuery);
    const hostCommunities: ModCommunity[] = hostSnap.docs.map((doc) => {
      const d = doc.data() as any;
      return {
        id: doc.id,
        slug: d.slug ?? doc.id,
        name: d.displayName,
        iconUrl: d.iconUrl,
        hostId: d.hostId,
      };
    });

    // 参加しているコミュニティを取得
    const allCommunities = await getDocs(collection(db, "communities"));
    const memberCommunities: ModCommunity[] = [];
    
    for (const communityDoc of allCommunities.docs) {
      const memberQuery = query(
        collection(db, "communities", communityDoc.id, "members"),
        where("userId", "==", uid)
      );
      const memberSnap = await getDocs(memberQuery);
      if (!memberSnap.empty) {
        const d = communityDoc.data() as any;
        memberCommunities.push({
          id: communityDoc.id,
          slug: d.slug ?? communityDoc.id,
          name: d.displayName,
          iconUrl: d.iconUrl,
          hostId: d.hostId,
        });
      }
    }

    // 重複を除去して結合
    const allCommunitiesMap = new Map();
    [...hostCommunities, ...memberCommunities].forEach(community => {
      allCommunitiesMap.set(community.id, community);
    });
    
    setCommunities(Array.from(allCommunitiesMap.values()));
    setLoading(false);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    // リアルタイムリスナーは複雑になるため、定期的に更新
    const interval = setInterval(() => {
      fetchCommunities();
    }, 5000); // 5秒ごとに更新

    // 初回実行
    fetchCommunities();

    return () => clearInterval(interval);
  }, [uid, fetchCommunities]);

  return { loading, communities, refetch: fetchCommunities };
}

export default useModeratedCommunities;
