// src/pages/CommentPage.tsx
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
import ClearIcon from "@mui/icons-material/Clear";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import CommentOptions from "../components/CommentOptions";

export default function CommentPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [post, setPost] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // 🔹 投稿データ取得（リアルタイムに変更した方がいい）
  useEffect(() => {
    if (!id) return;
    const ref = doc(db, "posts", id);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setPost({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [id]);

  // 🔹 コメント取得（リアルタイム）
  useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, "posts", id, "comments"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [id]);

  // 🔹 投稿に Like
  const handleLikePost = async () => {
    if (!id || !user) return;
    const ref = doc(db, "posts", id);
    if (post.likedBy?.includes(user.uid)) {
      await updateDoc(ref, { likedBy: arrayRemove(user.uid) });
    } else {
      await updateDoc(ref, {
        likedBy: arrayUnion(user.uid),
        dislikedBy: arrayRemove(user.uid),
      });
    }
  };

  // 🔹 投稿に Dislike
  const handleDislikePost = async () => {
    if (!id || !user) return;
    const ref = doc(db, "posts", id);
    if (post.dislikedBy?.includes(user.uid)) {
      await updateDoc(ref, { dislikedBy: arrayRemove(user.uid) });
    } else {
      await updateDoc(ref, {
        dislikedBy: arrayUnion(user.uid),
        likedBy: arrayRemove(user.uid),
      });
    }
  };

  // 🔹 新規コメント追加
  const handleComment = async () => {
    if (!user || !comment.trim()) return;
    await addDoc(collection(db, "posts", id!, "comments"), {
      text: comment.trim(),
      username: user.displayName || "名無し",
      avatarUrl: user.photoURL || "",
      uid: user.uid,
      createdAt: serverTimestamp(),
      likedBy: [],
      dislikedBy: [],
      parentId: null,
    });
    const postRef = doc(db, "posts", id!);
    await updateDoc(postRef, { commentsCount: increment(1) });
    setComment("");
  };

  // 🔹 返信コメント追加
  const handleReplySubmit = async (parentId: string) => {
    if (!user || !replyText.trim()) return;
    await addDoc(collection(db, "posts", id!, "comments"), {
      text: replyText.trim(),
      username: user.displayName || "名無し",
      avatarUrl: user.photoURL || "",
      uid: user.uid,
      createdAt: serverTimestamp(),
      likedBy: [],
      dislikedBy: [],
      parentId,
    });
    setReplyText("");
    setReplyingTo(null);
  };

  // 🔹 コメント削除
  const handleDelete = async (commentId: string) => {
    if (!id) return;
    await deleteDoc(doc(db, "posts", id, "comments", commentId));
    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, { commentsCount: increment(-1) });
  };

  // 🔹 コメント編集
  const handleEdit = async (commentId: string, newText: string) => {
    if (!id || !newText.trim()) return;
    const ref = doc(db, "posts", id, "comments", commentId);
    await updateDoc(ref, { text: newText.trim() });
  };

  // 🔹 コメント Like
  const handleLikeComment = async (
    commentId: string,
    likedBy: string[] = [],
    dislikedBy: string[] = []
  ) => {
    if (!id || !user) return;
    const ref = doc(db, "posts", id, "comments", commentId);
    if (likedBy.includes(user.uid)) {
      await updateDoc(ref, { likedBy: arrayRemove(user.uid) });
    } else {
      await updateDoc(ref, {
        likedBy: arrayUnion(user.uid),
        dislikedBy: arrayRemove(user.uid),
      });
    }
  };

  // 🔹 コメント Dislike
  const handleDislikeComment = async (
    commentId: string,
    likedBy: string[] = [],
    dislikedBy: string[] = []
  ) => {
    if (!id || !user) return;
    const ref = doc(db, "posts", id, "comments", commentId);
    if (dislikedBy.includes(user.uid)) {
      await updateDoc(ref, { dislikedBy: arrayRemove(user.uid) });
    } else {
      await updateDoc(ref, {
        dislikedBy: arrayUnion(user.uid),
        likedBy: arrayRemove(user.uid),
      });
    }
  };

  if (!post) return <Typography>Loading...</Typography>;

  // 🔹 再帰的にコメントを描画
  function renderComments(parentId: string | null, level = 0) {
    const items = comments.filter((c) => c.parentId === parentId);
    return items.map((c) => (
      <Box key={c.id} sx={{ ml: level * 4, mt: 1 }}>
        <CommentItem
          c={c}
          user={user}
          onLike={handleLikeComment}
          onDislike={handleDislikeComment}
          onDelete={handleDelete}
          onEdit={handleEdit}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          replyText={replyText}
          setReplyText={setReplyText}
          onReplySubmit={handleReplySubmit}
        />
        {renderComments(c.id, level + 1)}
      </Box>
    ));
  }

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
              {post.timestamp?.seconds &&
                new Date(post.timestamp.seconds * 1000).toLocaleString()}
            </Typography>
          </Box>
        </Box>

        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            {post.title}
          </Typography>
          <Typography variant="body1">{post.content}</Typography>
        </CardContent>

        {/* 👍👎 ボタン */}
        <Box sx={{ display: "flex", gap: 2, mt: 1, ml: 1 }}>
          <IconButton
            size="small"
            sx={{
              color: post.likedBy?.includes(user?.uid) ? "#1976d2" : "#bbb",
            }}
            onClick={handleLikePost}
          >
            <ThumbUpIcon fontSize="small" />
            <Typography sx={{ ml: 0.5, fontSize: "0.8rem" }}>
              {post.likedBy?.length || 0}
            </Typography>
          </IconButton>

          <IconButton
            size="small"
            sx={{
              color: post.dislikedBy?.includes(user?.uid) ? "#d32f2f" : "#bbb",
            }}
            onClick={handleDislikePost}
          >
            <ThumbDownIcon fontSize="small" />
            <Typography sx={{ ml: 0.5, fontSize: "0.8rem" }}>
              {post.dislikedBy?.length || 0}
            </Typography>
          </IconButton>
        </Box>
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

      {comments.filter((c) => !c.parentId).length === 0 ? (
        <Typography sx={{ color: "#888" }}>まだコメントはありません。</Typography>
      ) : (
        renderComments(null)
      )}
    </Box>
  );
}

// 🔹 コメント表示コンポーネント
function CommentItem({
  c,
  user,
  onLike,
  onDislike,
  onDelete,
  onEdit,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  onReplySubmit,
}: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(c.text);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        bgcolor: "#1e1e1e",
        p: 1.5,
        borderRadius: "8px",
        mb: 1,
      }}
    >
      <Avatar src={c.avatarUrl} sx={{ mr: 1 }} />
      <Box sx={{ flexGrow: 1 }}>
        <Typography sx={{ fontWeight: "bold", fontSize: "0.9rem" }}>
          {c.username}
        </Typography>

        {isEditing ? (
          <Box>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              sx={{ bgcolor: "#2c2c2c", input: { color: "#fff" }, mb: 1 }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  onEdit(c.id, editText);
                  setIsEditing(false);
                }}
              >
                保存
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setIsEditing(false)}
              >
                キャンセル
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: "#ccc", mb: 0.5 }}>
            {c.text}
          </Typography>
        )}

        {/* 👍👎💬 */}
        {!isEditing && (
          <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
            <IconButton
              size="small"
              sx={{ color: c.likedBy?.includes(user?.uid) ? "#1976d2" : "#bbb" }}
              onClick={() => onLike(c.id, c.likedBy || [], c.dislikedBy || [])}
            >
              <ThumbUpIcon fontSize="small" />
              <Typography sx={{ ml: 0.5, fontSize: "0.8rem" }}>
                {c.likedBy?.length || 0}
              </Typography>
            </IconButton>

            <IconButton
              size="small"
              sx={{
                color: c.dislikedBy?.includes(user?.uid) ? "#d32f2f" : "#bbb",
              }}
              onClick={() =>
                onDislike(c.id, c.likedBy || [], c.dislikedBy || [])
              }
            >
              <ThumbDownIcon fontSize="small" />
              <Typography sx={{ ml: 0.5, fontSize: "0.8rem" }}>
                {c.dislikedBy?.length || 0}
              </Typography>
            </IconButton>

            <IconButton
              size="small"
              sx={{ color: "#bbb" }}
              onClick={() => setReplyingTo(c.id)}
            >
              <ChatBubbleOutlineIcon fontSize="small" />
              <Typography sx={{ ml: 0.5, fontSize: "0.8rem" }}>返信</Typography>
            </IconButton>
          </Box>
        )}

        {/* 返信入力フォーム */}
        {replyingTo === c.id && (
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder={`@${c.username} に返信...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              sx={{ bgcolor: "#2c2c2c", input: { color: "#fff" }, mb: 1 }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => onReplySubmit(c.id)}
              >
                送信
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setReplyingTo(null)}
              >
                キャンセル
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* 自分のコメントだけ削除・編集可能 */}
      {user?.uid === c.uid && !isEditing && (
        <CommentOptions
          onDelete={() => onDelete(c.id)}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </Box>
  );
}
