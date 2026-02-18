import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { getCommunityById } from "../services/community";
import { createPost } from "../services/post";

export default function CreatePostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCommunity = async () => {
      if (!slug) return;
      try {
        // コミュニティをslugで検索
        const communities = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/communities`).then(res => res.json());
        const foundCommunity = communities.find((c: any) => c.slug === slug);
        if (foundCommunity) {
          setCommunity(foundCommunity);
        }
      } catch (error) {
        console.error("Error fetching community:", error);
      }
    };
    fetchCommunity();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!slug || !user || !community) return;

    setLoading(true);
    try {
      await createPost({
        title,
        content,
        username: user.displayName || "名無し",
        communitySlug: slug,
      });
      navigate(`/r/${slug}`);
    } catch (error) {
      console.error("投稿エラー:", error);
      alert("投稿に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={6}
        sx={{
          backgroundColor: "#1e1e1e",
          color: "#f0f0f0",
          p: 4,
          borderRadius: 3,
          mt: 4,
        }}
      >
        <Typography variant="h5" sx={{ mb: 3 }}>
          {community ? `新しい投稿を作成` : "読み込み中..."}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            variant="outlined"
            label="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
            sx={{
              mb: 2,
              input: { color: "#fff" },
              label: { color: "#bbb" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#888" },
              },
            }}
          />

          <TextField
            fullWidth
            variant="outlined"
            label="本文を入力"
            multiline
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={loading}
            sx={{
              mb: 3,
              textarea: { color: "#fff" },
              label: { color: "#bbb" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#888" },
              },
            }}
          />

          <Button type="submit" variant="contained" color="primary" fullWidth disabled={!community || loading}>
            {loading ? "投稿中..." : "投稿する"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
