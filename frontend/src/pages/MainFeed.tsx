import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useModeratedCommunities } from "../hooks/useModeratedCommunities";
import { db } from "../firebase";
import { collection, query, where, getDocs, or } from "firebase/firestore";
import Post from "../components/Post";

export default function MainFeed() {
  const { user, loading: authLoading } = useAuth();
  const { communities, loading: commLoading } = useModeratedCommunities(user?.uid);

  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user || authLoading || commLoading) return;

      const slugs = communities.map((c) => c.slug);

      // Firestore で条件を「uidが自分」または「communitySlugが参加コミュニティ」
      const q = query(
        collection(db, "posts"),
        or(
          where("uid", "==", user.uid),
          where("communitySlug", "in", slugs)
        )
      );

      const snap = await getDocs(q);
      setPosts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchPosts();
  }, [user, authLoading, communities, commLoading]);

  return (
    <div>
      {posts.map((p) => (
        <Post
          key={p.id}
          id={p.id}
          title={p.title}
          content={p.content}
          upvotes={p.upvotes ?? 0}
          username={p.username ?? "名無し"}
          timestamp={p.timestamp ?? ""}
          communitySlug={p.communitySlug}
        />
      ))}
    </div>
  );
}
