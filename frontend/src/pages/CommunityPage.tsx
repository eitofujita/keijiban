import { useParams, useNavigate } from "react-router-dom"; // ← navigateを追加
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  Avatar,
  Stack,
} from "@mui/material";

// コミュニティ型
type Community = DocumentData & {
  slug: string;
  name: string;
  description?: string;
  iconUrl?: string;
};

// 投稿型
type Post = DocumentData & {
  id: string;
  title?: string;
  content?: string;
};

export default function CommunityPage() {
  const { slug } = useParams();
  const navigate = useNavigate(); // ← 追加

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const cleanSlug = slug?.replace(/^@/, "");
    console.log("URLから取得したslug:", slug, "検索用slug:", cleanSlug);

    const fetchCommunity = async () => {
      if (!cleanSlug) return;
      const q = query(collection(db, "communities"), where("slug", "==", cleanSlug));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data() as Community;
        setCommunity(data);
      }
    };

    const fetchPosts = async () => {
      if (!cleanSlug) return;
      const q = query(collection(db, "posts"), where("communitySlug", "==", cleanSlug));
      const querySnapshot = await getDocs(q);
      setPosts(
        querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Post)
        )
      );
    };

    fetchCommunity();
    fetchPosts();
  }, [slug]);

  if (!community) return <Typography sx={{ color: "#fff", p: 2 }}>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2, color: "#fff" }}>
      {/* コミュニティヘッダー */}
      <Card sx={{ backgroundColor: "#1e1e1e", mb: 2, border: "1px solid #333" }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={community.iconUrl || undefined}
              alt={community.name}
              sx={{ width: 56, height: 56, bgcolor: "#555" }}
            >
              {community.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              @{community.displayName || community.name}
            </Typography>
          </Stack>

          {community.description && (
            <Typography variant="body2" sx={{ color: "#aaa", mt: 1 }}>
              {community.description}
            </Typography>
          )}

          <Button
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: "#ff4500",
              "&:hover": { backgroundColor: "#e03d00" },
              borderRadius: "20px",
              textTransform: "none",
              fontWeight: "bold",
            }}
            onClick={() => navigate(`/r/${slug}/create-post`)} // ← ここで遷移
          >
            ポスト
          </Button>
        </CardContent>
      </Card>

      {/* 投稿一覧 */}
      {posts.length === 0 ? (
        <Typography sx={{ color: "#aaa" }}>まだ投稿がありません</Typography>
      ) : (
        posts.map((post) => (
          <Card
            key={post.id}
            sx={{
              backgroundColor: "#1e1e1e",
              mb: 2,
              border: "1px solid #333",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {post.title || "(No title)"}
              </Typography>
              <Divider sx={{ my: 1, borderColor: "#333" }} />
              <Typography variant="body2" sx={{ color: "#ccc" }}>
                {post.content || ""}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}
