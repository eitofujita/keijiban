import { useAuth } from "../hooks/useAuth";
import { useModeratedCommunities } from "../hooks/useModeratedCommunities";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  deleteDoc,
  arrayRemove
} from "firebase/firestore";
import { useState } from "react";
import ForumIcon from "@mui/icons-material/Forum";

export default function ManageCommunities() {
  const { user } = useAuth();
  const { communities, loading } = useModeratedCommunities(user?.uid);

  const [editName, setEditName] = useState("");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const handleRename = async (slug: string) => {
    if (!editName.trim()) return;
    await updateDoc(doc(db, "communities", slug), {
      name: editName.trim(),
    });
    setEditingSlug(null);
    setEditName("");
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm("本当に削除しますか？")) return;
    await deleteDoc(doc(db, "communities", slug));
  };

  const handleLeave = async (slug: string) => {
    if (!user) return;
    if (!window.confirm("このコミュニティから退出しますか？")) return;
    await updateDoc(doc(db, "communities", slug), {
      memberIds: arrayRemove(user.uid),
      moderatorIds: arrayRemove(user.uid),
    });
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Manage Communities</h2>
      <List>
        {communities.map((c) => (
          <ListItem
            key={c.slug}
            sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            {c.iconUrl ? (
              <Avatar src={c.iconUrl} sx={{ width: 32, height: 32 }} />
            ) : (
              <ForumIcon sx={{ width: 32, height: 32, color: "#bbb" }} />
            )}

            {editingSlug === c.slug ? (
              <>
                <TextField
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{ backgroundColor: "#fff", borderRadius: "4px" }}
                />
                <IconButton onClick={() => handleRename(c.slug)}>
                  <SaveIcon sx={{ color: "#4caf50" }} /> {/* 緑 */}
                </IconButton>
                <IconButton onClick={() => setEditingSlug(null)}>
                  <CloseIcon sx={{ color: "#f44336" }} /> {/* 赤 */}
                </IconButton>
              </>
            ) : (
              <>
                <ListItemText
                  primary={c.name}
                  secondary={`r/${c.slug}`}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  onClick={() => {
                    setEditingSlug(c.slug);
                    setEditName(c.name ?? "");
                  }}
                >
                  <EditIcon sx={{ color: "#90caf9" }} /> {/* 水色 */}
                </IconButton>
                <IconButton onClick={() => handleLeave(c.slug)}>
                  <ExitToAppIcon sx={{ color: "#ffb74d" }} /> {/* オレンジ */}
                </IconButton>
                <IconButton onClick={() => handleDelete(c.slug)}>
                  <DeleteIcon sx={{ color: "#ef5350" }} /> {/* 赤 */}
                </IconButton>
              </>
            )}
          </ListItem>
        ))}
      </List>
    </div>
  );
}
