import { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";

type CommentFormProps = {
  postId: string;
};

export default function CommentForm({ postId }: CommentFormProps) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!user) {
      alert("コメントするにはログインが必要です。");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        text: comment.trim(),
        userId: user.uid,
        username: user.displayName || "名無し",
        createdAt: serverTimestamp(),
      });

      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, { commentsCount: increment(1) });

      setComment("");
    } catch (error) {
      console.error("コメント送信エラー:", error);
      alert("コメントの送信に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", gap: 1, mt: 1 }}
    >
      <TextField
        size="small"
        fullWidth
        variant="outlined"
        placeholder="コメントを入力..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={loading}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            handleSubmit(e as any); // Enterで送信
          }
        }}
        sx={{
          backgroundColor: "#2c2c2c",
          borderRadius: "8px",
          input: { color: "#fff" },
        }}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        sx={{
          backgroundColor: loading ? "#555" : "#1976d2",
          textTransform: "none",
          minWidth: "80px",
        }}
      >
        {loading ? "送信中..." : "送信"}
      </Button>
    </Box>
  );
}
