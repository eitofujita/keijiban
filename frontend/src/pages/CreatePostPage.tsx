import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
} from "@mui/material";

export default function CreatePostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;

    try {
      await addDoc(collection(db, "posts"), {
        communitySlug: slug, // コミュニティを紐付け
        title,
        content,
        createdAt: serverTimestamp(),
      });
      navigate(`/r/${slug}`); // 作成後にそのコミュニティページへ戻る
    } catch (error) {
      console.error("投稿エラー:", error);
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
          新しい投稿を作成（@{slug}）
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            variant="outlined"
            label="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
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

          <Button type="submit" variant="contained" color="primary" fullWidth>
            投稿する
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
