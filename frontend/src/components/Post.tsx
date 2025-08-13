import { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

type PostProps = {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  username: string;
  timestamp: string;
};

export const Post = ({
  title,
  content,
  upvotes,
  username,
  timestamp,
}: PostProps) => {
  const [likes, setLikes] = useState(upvotes);
  const [dislikes, setDislikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [comments, setComments] = useState<string[]>([]);
  const [commentText, setCommentText] = useState("");

  const handleLike = () => {
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
      if (hasDisliked) {
        setDislikes((prev) => prev - 1);
        setHasDisliked(false);
      }
    }
  };

  const handleDislike = () => {
    if (hasDisliked) {
      setDislikes((prev) => prev - 1);
      setHasDisliked(false);
    } else {
      setDislikes((prev) => prev + 1);
      setHasDisliked(true);
      if (hasLiked) {
        setLikes((prev) => prev - 1);
        setHasLiked(false);
      }
    }
  };

  const handleAddComment = () => {
    if (commentText.trim() !== "") {
      setComments([...comments, commentText]);
      setCommentText("");
    }
  };

  return (
    <Card
      sx={{
        backgroundColor: "#1e1e1e",
        color: "#f0f0f0",
        borderRadius: "12px",   // ← 小さめ
        mb: 3,                  // ← 間隔を詰める
        p: 1.5,                 // ← 余白を減らす
        boxShadow: 4,           // ← 軽め
      }}
    >
      <CardHeader
        avatar={<Avatar src="/profile.png" sx={{ width: 32, height: 32 }} />} // ← 小さめ
        title={
          <Typography sx={{ fontWeight: "bold", color: "#f0f0f0", fontSize: "0.95rem" }}>
            {username}
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "#aaa", fontSize: "0.75rem" }}>
            {timestamp}
          </Typography>
        }
        sx={{ pb: 0.5 }} // ← 下余白を詰める
      />

      <CardContent sx={{ pt: 1, pb: 1 }}>
        <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 700, fontSize: "1rem" }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.25, lineHeight: 1.55 }}>
          {content}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
          <IconButton
            onClick={handleLike}
            aria-label="like"
            sx={{ color: hasLiked ? "#1976d2" : "#bbb", p: 0.5 }} // ← コンパクト
          >
            <ThumbUpIcon fontSize="small" />
            <Typography sx={{ ml: 0.5, color: "inherit", fontSize: "0.9rem" }}>{likes}</Typography>
          </IconButton>

          <IconButton
            onClick={handleDislike}
            aria-label="dislike"
            sx={{ color: hasDisliked ? "#d32f2f" : "#bbb", p: 0.5 }} // ← コンパクト
          >
            <ThumbDownIcon fontSize="small" />
            <Typography sx={{ ml: 0.5, color: "inherit", fontSize: "0.9rem" }}>{dislikes}</Typography>
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", color: "#bbb", ml: 0.5 }}>
            <ChatBubbleOutlineIcon sx={{ mr: 0.5 }} fontSize="small" />
            <Typography sx={{ fontSize: "0.9rem" }}>{comments.length}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 0.75, mb: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="コメントを入力..."
            sx={{
              "& .MuiInputBase-input": { color: "white", fontSize: "0.9rem", py: 0.9 }, // ← 高さ控えめ
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#888" },
              },
            }}
          />
          <Button
            variant="contained"
            color="success"
            onClick={handleAddComment}
            sx={{ fontSize: "0.8rem", py: 0.75, px: 1.5, whiteSpace: "nowrap" }} // ← コンパクト
          >
            投稿
          </Button>
        </Box>

        <List dense>
          {comments.map((c, i) => (
            <ListItem key={i} disablePadding>
              <ListItemText
                primary={`・${c}`}
                primaryTypographyProps={{ sx: { color: "#ccc", fontSize: "0.9rem" } }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
