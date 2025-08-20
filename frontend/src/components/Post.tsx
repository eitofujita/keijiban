import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useModeratedCommunities } from "../hooks/useModeratedCommunities";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";

type PostProps = {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  username: string;
  timestamp: string;
  communitySlug?: string;
  avatarUrl?: string;
  commentsCount?: number;
};

export const Post = ({
  id,
  title,
  content,
  upvotes,
  username,
  timestamp,
  communitySlug,
  avatarUrl,
  commentsCount = 0,
}: PostProps) => {
  const { user } = useAuth();
  const { communities, loading } = useModeratedCommunities(user?.uid);

  const [likes, setLikes] = useState(upvotes);
  const [dislikes, setDislikes] = useState(0);
  const [commentCount, setCommentCount] = useState(commentsCount);

  // ✅ 自分がいいね／バッドしているかどうか
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);

  // 🔹 Firestoreを購読
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "posts", id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLikes(data.likes ?? 0);
        setDislikes(data.dislikes ?? 0);
        setCommentCount(data.commentsCount ?? 0);
        if (user) {
          setHasLiked(data.likedBy?.includes(user.uid));
          setHasDisliked(data.dislikedBy?.includes(user.uid));
        }
      }
    });
    return () => unsub();
  }, [id, user]);

  // 🔹 いいね処理（トグル式）
  const handleLike = async () => {
    if (!user) return;
    const postRef = doc(db, "posts", id);

    if (hasLiked) {
      // 取り消す
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: arrayRemove(user.uid),
      });
    } else {
      // いいねを追加
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: arrayUnion(user.uid),
        ...(hasDisliked && {
          dislikes: increment(-1),
          dislikedBy: arrayRemove(user.uid),
        }),
      });
    }
  };

  // 🔹 バッド処理（トグル式）
  const handleDislike = async () => {
    if (!user) return;
    const postRef = doc(db, "posts", id);

    if (hasDisliked) {
      // 取り消す
      await updateDoc(postRef, {
        dislikes: increment(-1),
        dislikedBy: arrayRemove(user.uid),
      });
    } else {
      // バッドを追加
      await updateDoc(postRef, {
        dislikes: increment(1),
        dislikedBy: arrayUnion(user.uid),
        ...(hasLiked && {
          likes: increment(-1),
          likedBy: arrayRemove(user.uid),
        }),
      });
    }
  };

  const communityName = !loading
    ? communities.find((c) => c.slug === communitySlug)?.name || ""
    : "";

  return (
    <Card
      sx={{
        backgroundColor: "#1e1e1e",
        color: "#f0f0f0",
        borderRadius: "12px",
        mb: 3,
        p: 1.5,
        boxShadow: 4,
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            src={avatarUrl || undefined}
            sx={{ width: 32, height: 32, bgcolor: "#555" }}
          >
            {!avatarUrl && username.charAt(0).toUpperCase()}
          </Avatar>
        }
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{
                fontWeight: "bold",
                color: "#f0f0f0",
                fontSize: "0.95rem",
              }}
            >
              {username}
            </Typography>
            {communityName && (
              <Typography
                variant="body2"
                sx={{
                  color: "#90caf9",
                  fontSize: "0.75rem",
                  backgroundColor: "#2c2c2c",
                  px: 1,
                  py: 0.2,
                  borderRadius: "8px",
                }}
              >
                @{communityName}
              </Typography>
            )}
          </Box>
        }
        subheader={
          <Typography
            variant="body2"
            sx={{ color: "#aaa", fontSize: "0.75rem" }}
          >
            {timestamp}
          </Typography>
        }
        sx={{ pb: 0.5 }}
      />

      <CardContent sx={{ pt: 1, pb: 1 }}>
        <Typography
          variant="subtitle1"
          sx={{ mb: 0.5, fontWeight: 700, fontSize: "1rem" }}
        >
          {title}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.25, lineHeight: 1.55 }}>
          {content}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.25 }}>
          <IconButton
            onClick={handleLike}
            aria-label="like"
            sx={{ color: hasLiked ? "#1976d2" : "#bbb", p: 0.5 }}
          >
            <ThumbUpIcon fontSize="small" />
            <Typography sx={{ ml: 0.5, fontSize: "0.9rem" }}>
              {likes}
            </Typography>
          </IconButton>

          <IconButton
            onClick={handleDislike}
            aria-label="dislike"
            sx={{ color: hasDisliked ? "#d32f2f" : "#bbb", p: 0.5 }}
          >
            <ThumbDownIcon fontSize="small" />
            <Typography sx={{ ml: 0.5, fontSize: "0.9rem" }}>
              {dislikes}
            </Typography>
          </IconButton>

          <IconButton
            component={Link}
            to={`/post/${id}/comments`}
            sx={{ color: "#bbb", p: 0.5 }}
          >
            <ChatBubbleOutlineIcon fontSize="small" />
            <Typography sx={{ ml: 0.5, fontSize: "0.9rem" }}>
              {commentCount ?? 0}
            </Typography>
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Post;
