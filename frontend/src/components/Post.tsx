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
        borderRadius: "16px",
        mb: 4,
        p: 2,
        boxShadow: 6,
      }}
    >
      <CardHeader
        avatar={<Avatar src="/profile.png" />}
        title={
          <Typography sx={{ fontWeight: "bold", color: "#f0f0f0" }}>
            {username}
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "#aaa" }}>
            {timestamp}
          </Typography>
        }
      />

      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {content}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <IconButton onClick={handleLike} color={hasLiked ? "primary" : "default"}>
            <ThumbUpIcon />
            <Typography sx={{ ml: 0.5 }}>{likes}</Typography>
          </IconButton>
          <IconButton onClick={handleDislike} color={hasDisliked ? "error" : "default"}>
            <ThumbDownIcon />
            <Typography sx={{ ml: 0.5 }}>{dislikes}</Typography>
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ChatBubbleOutlineIcon sx={{ mr: 0.5 }} />
            <Typography>{comments.length}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="コメントを入力..."
            sx={{
              input: { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#555",
                },
                "&:hover fieldset": {
                  borderColor: "#888",
                },
              },
            }}
          />
          <Button variant="contained" color="success" onClick={handleAddComment}>
            投稿
          </Button>
        </Box>

        <List dense>
          {comments.map((c, i) => (
            <ListItem key={i} disablePadding>
              <ListItemText
                primary={`・${c}`}
                primaryTypographyProps={{ style: { color: "#ccc" } }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
