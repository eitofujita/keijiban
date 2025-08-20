// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { Box, Typography } from "@mui/material";
import { Post as PostCard } from "../components/Post";

type Post = DocumentData & {
  id: string;
  title?: string;
  content?: string;
  username?: string;
  avatarUrl?: string;
  communitySlug?: string;
  timestamp?: Timestamp | null;
  upvotes?: number;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "posts"),
          orderBy("timestamp", "desc"),
          limit(50)
        );
        const snapshot = await getDocs(q);
        setPosts(
          snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Post))
        );
      } finally {
        setLoading(false);
      }
    })();
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
            title={post.title ?? "(No title)"}
            content={post.content ?? ""}
            username={post.username ?? "名無し"}
            avatarUrl={post.avatarUrl ?? ""}
            communitySlug={post.communitySlug ?? ""}
            timestamp={
              post.timestamp ? post.timestamp.toDate().toLocaleString() : ""
            }
            upvotes={post.upvotes ?? 0}
          />
        ))
      )}
    </Box>
  );
}
