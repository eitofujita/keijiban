import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from "@mui/material";

const Create = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user === null) {
      console.log("ログインしていないため、ログインページへ遷移");
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      console.log("❌ ユーザー情報が存在しないため、投稿処理中止");
      return;
    }

    console.log("🟢 投稿処理開始");

    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        uid: user.uid,
        createdAt: new Date(),
      });

      console.log("✅ 投稿成功:", { title, content, uid: user.uid });
      navigate("/");
      console.log("🏠 ホームに遷移しました");
    } catch (error) {
      console.error("❌ 投稿失敗:", error);
      alert("投稿に失敗しました。");
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
          新しい投稿を作成
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
              input: { color: "#fff" },
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
};

export default Create;
