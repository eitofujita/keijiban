import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

export default function CommentPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  // 🔹 投稿データ取得
  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      const docRef = doc(db, "posts", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) setPost({ id: snap.id, ...snap.data() });
    };
    fetchPost();
  }, [id]);

  // 🔹 コメント取得（リアルタイム）
  useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, "posts", id, "comments"),
      orderBy("timestamp", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [id]);

  // 🔹 コメント追加
  const handleComment = async () => {
    if (!user || !comment.trim()) return;

    await addDoc(collection(db, "posts", id!, "comments"), {
      text: comment,
      user: user.displayName,
      avatar: user.photoURL,
      uid: user.uid,
      timestamp: serverTimestamp(),
    });

    setComment("");
  };

  // 🔹 コメント削除
  const handleDelete = async (commentId: string) => {
    if (!id) return;
      await deleteDoc(doc(db, "posts", id, "comments", commentId));
    
  };

  if (!post) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: "700px", margin: "0 auto", color: "#fff" }}>
      {/* 投稿表示 */}
      <Card sx={{ bgcolor: "#1e1e1e", mb: 3, p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Avatar src={post.communityIcon || ""} sx={{ mr: 1 }} />
          <Box>
            <Typography
              component={Link}
              to={`/r/${post.communitySlug}`}
              sx={{
                fontWeight: "bold",
                color: "#90caf9",
                textDecoration: "none",
              }}
            >
              @{post.communityName}
            </Typography>
            <Typography variant="body2" sx={{ color: "#aaa" }}>
              {post.username} ・{" "}
              {new Date(post.timestamp?.seconds * 1000).toLocaleString()}
            </Typography>
          </Box>
        </Box>

        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            {post.title}
          </Typography>
          <Typography variant="body1">{post.content}</Typography>
        </CardContent>
      </Card>

      {/* コメント入力 */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="コメントを入力..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleComment();
            }
          }}
          sx={{ bgcolor: "#2c2c2c", input: { color: "#fff" } }}
        />

        {/* クリアボタン */}
        <IconButton onClick={() => setComment("")} disabled={!comment}>
          <ClearIcon sx={{ color: "#aaa" }} />
        </IconButton>

        <Button variant="contained" onClick={handleComment}>
          送信
        </Button>
      </Box>

      {/* コメント一覧 */}
      <Typography variant="h6" sx={{ mb: 1 }}>
        コメント一覧
      </Typography>
      <Divider sx={{ mb: 2, bgcolor: "#444" }} />

      {comments.length === 0 ? (
        <Typography sx={{ color: "#888" }}>まだコメントはありません。</Typography>
      ) : (
        comments.map((c) => (
          <Box
            key={c.id}
            sx={{ display: "flex", alignItems: "center", mb: 2 }}
          >
            <Avatar src={c.avatar} sx={{ mr: 1 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                {c.user}
              </Typography>
              <Typography variant="body2" sx={{ color: "#ccc" }}>
                {c.text}
              </Typography>
            </Box>
            {/* 自分のコメントだけ削除可能 */}
            {user?.uid === c.uid && (
              <IconButton onClick={() => handleDelete(c.id)}>
                <DeleteIcon sx={{ color: "#d32f2f" }} />
              </IconButton>
            )}
          </Box>
        ))
      )}
    </Box>
  );
}
