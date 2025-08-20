import { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import CommentOptions from "./CommentOptions";

type Props = {
  id: string;
  text: string;
  username: string;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newText: string) => void;
};

export default function CommentEdit({ id, text, username, onDelete, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(id, editText); // Firestore 更新を親に依頼
    setIsEditing(false);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
      <Box sx={{ flexGrow: 1 }}>
        {isEditing ? (
          <>
            <TextField
              fullWidth
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              size="small"
            />
            <Button onClick={handleSave} size="small">保存</Button>
            <Button onClick={() => setIsEditing(false)} size="small">キャンセル</Button>
          </>
        ) : (
          <Typography>{text}</Typography>
        )}
      </Box>

      <CommentOptions
        onEdit={handleEdit}
        onDelete={() => onDelete(id)}
      />
    </Box>
  );
}
