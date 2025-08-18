

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";

export default function CreatePostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [community, setCommunity] = useState<any>(null);

 
  useEffect(() => {
    const fetchCommunity = async () => {
      if (!slug) return;
      const q = query(collection(db, "communities"), where("slug", "==", slug));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setCommunity(snapshot.docs[0].data());
      }
    };
    fetchCommunity();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!slug || !user || !community) return; 

    try {
      await addDoc(collection(db, "posts"), {
        communitySlug: slug,
        communityName: community.displayName,      
        communityIcon: community.iconUrl || "", 
        title,
        content,
        uid: user.uid,
        username: user.displayName || "",
        avatarUrl: user.photoURL || "",
        timestamp: serverTimestamp(),
        commentsCount: 0,
      });
      navigate(`/r/${slug}`);
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
          {community ? `新しい投稿を作成（r/${community.name}）` : "読み込み中..."}
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

          <Button type="submit" variant="contained" color="primary" fullWidth disabled={!community}>
            投稿する
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
