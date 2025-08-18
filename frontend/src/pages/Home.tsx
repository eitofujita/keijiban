// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import type { DocumentData, Timestamp } from "firebase/firestore";
import { Box, Typography } from "@mui/material";
import { Post as PostCard } from "../components/Post";



// 投稿型
type Post = DocumentData & {
  id: string;
  title?: string;
  content?: string;
  username?: string;
  avatarUrl?: string;
  communitySlug?: string;
  timestamp?: Timestamp;
  upvotes?: number;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      const q = query(
        collection(db, "posts"),
        orderBy("timestamp", "desc") // 新しい順
      );
      const snapshot = await getDocs(q);

      setPosts(
        snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Post)
        )
      );
      setLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2, color: "#fff" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        最新の投稿
      </Typography>

      {loading ? (
        <Typography sx={{ color: "#aaa" }}>読み込み中...</Typography>
      ) : posts.length === 0 ? (
        <Typography sx={{ color: "#aaa" }}>まだ投稿がありません</Typography>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            title={post.title || "(No title)"}
            content={post.content || ""}
            username={post.username || "名無し"}
            avatarUrl={post.avatarUrl || ""}
            timestamp={
              post.timestamp ? post.timestamp.toDate().toLocaleString() : ""
            }
            upvotes={post.upvotes || 0}
            
            communitySlug={post.communitySlug || ""}
          />
        ))
      )}
    </Box>
  );
}
