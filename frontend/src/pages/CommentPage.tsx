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

import { useAuth } from "../hooks/useAuth";
import CommentOptions from "../components/CommentOptions";
import {
  getCommentsByPostId,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentReaction,
  type Comment,
} from "../services/comment";
import { getPostById, togglePostReaction, type Post } from "../services/post";

export default function CommentPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);

  // 投稿データ取得
  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const postData = await getPostById(id);
        setPost(postData);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    // 定期的に更新（ポーリング）
    const interval = setInterval(fetchPost, 3000);
    return () => clearInterval(interval);
  }, [id]);

  // コメント取得
  useEffect(() => {
    if (!id) return;
    const fetchComments = async () => {
      try {
        const commentsData = await getCommentsByPostId(id);
        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
    // 定期的に更新（ポーリング）
    const interval = setInterval(fetchComments, 3000);
    return () => clearInterval(interval);
  }, [id]);

  // 新規コメント追加
  const handleComment = async () => {
    if (!user || !comment.trim() || !id) return;
    try {
      await createComment(id, {
        text: comment.trim(),
        username: user.displayName || "名無し",
        userId: user.uid,
        parentId: null,
        avatarUrl: user.photoURL || "",
      });
      setComment("");
      // コメント一覧を再取得
      const commentsData = await getCommentsByPostId(id);
      setComments(commentsData);
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("コメントの送信に失敗しました。");
    }
  };

  // 返信コメント追加
  const handleReplySubmit = async (parentId: string) => {
    if (!user || !replyText.trim() || !id) return;
    try {
      await createComment(id, {
        text: replyText.trim(),
        username: user.displayName || "名無し",
        userId: user.uid,
        parentId,
        avatarUrl: user.photoURL || "",
      });
      setReplyText("");
      setReplyingTo(null);
      // コメント一覧を再取得
      const commentsData = await getCommentsByPostId(id);
      setComments(commentsData);
    } catch (error) {
      console.error("Error creating reply:", error);
      alert("返信の送信に失敗しました。");
    }
  };

  // コメント削除
  const handleDelete = async (commentId: string) => {
    if (!id || !user) return;
    try {
      await deleteComment(commentId, user.uid);
      // コメント一覧を再取得
      const commentsData = await getCommentsByPostId(id);
      setComments(commentsData);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("コメントの削除に失敗しました。");
    }
  };

  // コメント編集
  const handleEdit = async (commentId: string, newText: string) => {
    if (!id || !newText.trim() || !user) return;
    try {
      await updateComment(commentId, newText.trim(), user.uid);
      // コメント一覧を再取得
      const commentsData = await getCommentsByPostId(id);
      setComments(commentsData);
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("コメントの更新に失敗しました。");
    }
  };

  // コメント Like
  const handleLikeComment = async (commentId: string) => {
    if (!id || !user) return;
    try {
      const updatedComment = await toggleCommentReaction(commentId, user.uid, "like");
      // コメント一覧を更新
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? updatedComment : c))
      );
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  // コメント Dislike
  const handleDislikeComment = async (commentId: string) => {
    if (!id || !user) return;
    try {
      const updatedComment = await toggleCommentReaction(commentId, user.uid, "dislike");
      // コメント一覧を更新
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? updatedComment : c))
      );
    } catch (error) {
      console.error("Error disliking comment:", error);
    }
  };

  if (loading || !post) return <Typography>Loading...</Typography>;

  // 再帰的にコメントを描画
  function renderComments(parentId: string | null, level = 0) {
    const items = comments.filter((c) => {
      const pid = c.parentId?.toString() || null;
      return pid === parentId;
    });
    return items.map((c) => (
      <Box key={c._id} sx={{ ml: level * 4, mt: 1 }}>
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
        {renderComments(c._id, level + 1)}
      </Box>
    ));
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "";
    }
  };

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
              @{post.communityName || post.communitySlug}
            </Typography>
            <Typography variant="body2" sx={{ color: "#aaa" }}>
              {post.username} ・ {formatDate(post.createdAt)}
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
              color: post.likedBy?.includes(user?.uid || "") ? "#1976d2" : "#bbb",
            }}
            onClick={async () => {
              if (!id || !user) return;
              try {
                const updatedPost = await togglePostReaction(id, user.uid, "like");
                setPost(updatedPost);
              } catch (error) {
                console.error("Error liking post:", error);
              }
            }}
          >
            <ThumbUpIcon fontSize="small" />
            <Typography sx={{ ml: 0.5, fontSize: "0.8rem" }}>
              {post.likes || 0}
            </Typography>
          </IconButton>

          <IconButton
            size="small"
            sx={{
              color: post.dislikedBy?.includes(user?.uid || "") ? "#d32f2f" : "#bbb",
            }}
            onClick={async () => {
              if (!id || !user) return;
              try {
                const updatedPost = await togglePostReaction(id, user.uid, "dislike");
                setPost(updatedPost);
              } catch (error) {
                console.error("Error disliking post:", error);
              }
            }}
          >
            <ThumbDownIcon fontSize="small" />
            <Typography sx={{ ml: 0.5, fontSize: "0.8rem" }}>
              {post.dislikes || 0}
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

// コメント表示コンポーネント
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
}: {
  c: Comment;
  user: any;
  onLike: (commentId: string) => void;
  onDislike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onEdit: (commentId: string, newText: string) => void;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onReplySubmit: (parentId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(c.text);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "";
    }
  };

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
        <Typography variant="caption" sx={{ color: "#888", ml: 1 }}>
          {formatDate(c.createdAt)}
        </Typography>

        {isEditing ? (
          <Box>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              sx={{ bgcolor: "#2c2c2c", input: { color: "#fff" }, mb: 1, mt: 1 }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  onEdit(c._id, editText);
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
          <Typography variant="body2" sx={{ color: "#ccc", mb: 0.5, mt: 0.5 }}>
            {c.text}
          </Typography>
        )}

        {/* 👍👎💬 */}
        {!isEditing && (
          <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
            <IconButton
              size="small"
              sx={{
                color: c.likedBy?.includes(user?.uid) ? "#1976d2" : "#bbb",
              }}
              onClick={() => onLike(c._id)}
            >
              <ThumbUpIcon fontSize="small" />
              <Typography sx={{ ml: 0.5, fontSize: "0.8rem" }}>
                {c.likes || 0}
              </Typography>
            </IconButton>

            <IconButton
              size="small"
              sx={{
                color: c.dislikedBy?.includes(user?.uid) ? "#d32f2f" : "#bbb",
              }}
              onClick={() => onDislike(c._id)}
            >
              <ThumbDownIcon fontSize="small" />
              <Typography sx={{ ml: 0.5, fontSize: "0.8rem" }}>
                {c.dislikes || 0}
              </Typography>
            </IconButton>

            <IconButton
              size="small"
              sx={{ color: "#bbb" }}
              onClick={() => setReplyingTo(c._id)}
            >
              <ChatBubbleOutlineIcon fontSize="small" />
              <Typography sx={{ ml: 0.5, fontSize: "0.8rem" }}>返信</Typography>
            </IconButton>
          </Box>
        )}

        {/* 返信入力フォーム */}
        {replyingTo === c._id && (
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
                onClick={() => onReplySubmit(c._id)}
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
      {user?.uid === c.userId && !isEditing && (
        <CommentOptions
          onDelete={() => onDelete(c._id)}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </Box>
  );
}
