// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Post as PostCard } from "../components/Post";

type Post = {
  objectID: string;
  title?: string;
  content?: string;
  username?: string;
  avatarUrl?: string;
  communitySlug?: string;
  createdAt?: any;
  likes?: number;
  dislikes?: number;
  comments?: number;
};

import { getAllPosts } from "../services/post";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAllPosts();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "";
    
    try {
      // Handle Firestore Timestamp
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString();
      }
      
      // Handle regular Date object or string
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return "";
    }
  };

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
            key={post.objectID}
            id={post.objectID}
            title={post.title ?? "(No title)"}
            content={post.content ?? ""}
            username={post.username ?? "名無し"}
            avatarUrl={post.avatarUrl ?? ""}
            communitySlug={post.communitySlug ?? ""}
            timestamp={formatTimestamp(post.createdAt)}
            upvotes={post.likes ?? 0}
          />
        ))
      )}
    </Box>
  );
}
