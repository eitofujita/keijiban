import { useAuth } from "../hooks/useAuth";
import { useModeratedCommunities } from "../hooks/useModeratedCommunities";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Avatar,
  Typography,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import ForumIcon from "@mui/icons-material/Forum";
import { doc, updateDoc, deleteDoc, arrayRemove } from "firebase/firestore";
import { db } from "../firebase";
import { useState } from "react";

export interface ModCommunity {
  id: string; // Firestore document ID
  slug: string;
  name: string;
  description?: string;
  iconUrl?: string;
}

export default function ManageCommunities() {
  const { user } = useAuth();
  const { communities, loading, refetch } = useModeratedCommunities(user?.uid);

  const [editName, setEditName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateDoc(doc(db, "communities", id), { displayName: editName.trim() });
      console.log("名前を更新:", editName.trim());
      setEditingId(null);
      setEditName("");
      refetch();
    } catch (err) {
      console.error("名前更新エラー:", err);
      alert("名前の更新に失敗しました: " + (err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("本当に削除しますか？")) return;
    await deleteDoc(doc(db, "communities", id));
    refetch();
  };

  const handleLeave = async (id: string) => {
    if (!user) return;
    if (!window.confirm("このコミュニティから退出しますか？")) return;
    await updateDoc(doc(db, "communities", id), {
      memberIds: arrayRemove(user.uid),
      moderatorIds: arrayRemove(user.uid),
    });
    refetch();
  };

  if (loading) {
    return (
      <Typography variant="body1" sx={{ color: "#bbb", p: 2, fontSize: "0.85rem" }}>
        読み込み中...
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h5"
        sx={{ mb: 2, color: "#fff", fontSize: "0.85rem", fontWeight: "bold" }}
      >
        コミュニティーの設定
      </Typography>
      <List>
        {communities.map((c) => (
          <ListItem
            key={c.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              backgroundColor: "#1e1e1e",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              mb: 1,
              px: 2,
              py: 1,
            }}
          >
            {c.iconUrl ? (
              <Avatar src={c.iconUrl} sx={{ width: 40, height: 40 }} />
            ) : (
              <ForumIcon sx={{ width: 40, height: 40, color: "#90caf9" }} />
            )}

            {editingId === c.id ? (
              <>
                <TextField
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleRename(c.id);
                    }
                  }}
                  size="small"
                  variant="outlined"
                  sx={{
                    backgroundColor: "#2c2c2c",
                    borderRadius: "6px",
                    input: { color: "#fff", fontSize: "0.85rem" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#90caf9" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#42a5f5",
                    },
                  }}
                />
                <IconButton onClick={() => handleRename(c.id)} sx={{ color: "#4caf50" }}>
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={() => setEditingId(null)} sx={{ color: "#f44336" }}>
                  <CloseIcon />
                </IconButton>
              </>
            ) : (
              <>
                <ListItemText
                  primary={c.name}
                  secondary={`@${c.slug}`}
                  sx={{
                    flex: 1,
                    "& .MuiListItemText-primary": {
                      color: "#fff",
                      fontSize: "0.85rem",
                    },
                    "& .MuiListItemText-secondary": {
                      color: "#aaa",
                      fontSize: "0.75rem",
                    },
                  }}
                />
                <IconButton
                  onClick={() => {
                    setEditingId(c.id);
                    setEditName(c.name ?? "");
                  }}
                  sx={{ color: "#90caf9" }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleLeave(c.id)} sx={{ color: "#ffb74d" }}>
                  <ExitToAppIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(c.id)} sx={{ color: "#ef5350" }}>
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
