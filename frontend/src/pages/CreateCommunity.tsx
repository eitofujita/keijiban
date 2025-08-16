// src/pages/CreateCommunity.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Switch, FormControlLabel,
  Button, Box, Typography, Stack, Alert, Avatar
} from "@mui/material";
import {
  addDoc, collection, serverTimestamp, getDocs, query, where, limit
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";

// 🔹 Storage 用
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const NAME_MAX = 50;
const DESC_MAX = 500;

// 半角英数字と _- のみ。先頭は英字。
const nameToSlug = (name: string) => name.trim();

export default function CreateCommunity() {
  const { user } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [showOnProfile, setShowOnProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 アイコンアップロード用 state
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const slug = useMemo(() => nameToSlug(name), [name]);
  const nameLen = name.trim().length;
  const descLen = desc.trim().length;

  const canSubmit =
    !!user &&
    nameLen > 0 &&
    nameLen <= NAME_MAX &&
    descLen <= DESC_MAX &&
    slug.length > 0;

  const close = () => nav(-1);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      // 重複チェック（slug 一意）
      const q = query(
        collection(db, "communities"),
        where("slug", "==", slug),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        setError("その名前は既に使われています。別の名前を入力してください。");
        setSubmitting(false);
        return;
      }

      let iconUrl = user?.photoURL || "";

      // 🔹 Storage にアップロード（拡張子付き）
      if (iconFile) {
        const storage = getStorage();
        const ext = iconFile.name.split(".").pop(); // jpg, png など
        const fileName = `${slug}_${Date.now()}.${ext}`;
        const storageRef = ref(storage, `communityIcons/${fileName}`);
        await uploadBytes(storageRef, iconFile);
        iconUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "communities"), {
        slug,
        displayName: name.trim(),
        description: desc.trim(),
        isPrivate,
        showOnProfile,
        ownerUid: user!.uid,
        moderatorIds: [user!.uid],
        memberIds: [user!.uid],
        createdAt: serverTimestamp(),
        membersCount: 1,
        iconUrl, // 🔹 Storage の URL か photoURL
      });

      close();
    } catch (e: any) {
      console.error("🔥 Upload/CreateCommunity error:", e);
      setError(e?.message ?? "作成に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onClose={close} fullWidth maxWidth="sm"
      PaperProps={{ sx: { backgroundColor: "#1e1e1e", color: "#fff" } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>コミュニティーを作成</DialogTitle>

      <DialogContent dividers sx={{ borderColor: "#333" }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5, color: "#cfd8dc" }}>
              名前<span style={{ color: "#ef5350" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
              placeholder="例: アニメ研究"
              helperText={`${nameLen}/${NAME_MAX}`}
              InputProps={{ sx: { color: "#fff" } }}
              FormHelperTextProps={{ sx: { textAlign: "right", color: "#90a4ae" } }}
            />
            {slug && (
              <Typography variant="caption" sx={{ mt: 0.5, color: "#90a4ae" }}>
                URL: /c/{slug}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5, color: "#cfd8dc" }}>
              説明
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value.slice(0, DESC_MAX))}
              placeholder="コミュニティの説明 (任意)"
              helperText={`${descLen}/${DESC_MAX}`}
              InputProps={{ sx: { color: "#fff" } }}
              FormHelperTextProps={{ sx: { textAlign: "right", color: "#90a4ae" } }}
            />
          </Box>

          {/* 🔹 アイコンアップロード */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={iconPreview || ""}
              sx={{ width: 56, height: 56, bgcolor: "#444" }}
            />
            <Button
              variant="contained"
              component="label"
              sx={{ bgcolor: "#555", "&:hover": { bgcolor: "#777" } }}
            >
              アイコンをアップロード
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography sx={{ color: "#fff" }}>非公開にする</Typography>
                <Typography variant="caption" sx={{ color: "#90a4ae" }}>
                  将来は招待制などに拡張可
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={showOnProfile}
                onChange={(e) => setShowOnProfile(e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography sx={{ color: "#fff" }}>プロフィールを表示</Typography>
                <Typography variant="caption" sx={{ color: "#90a4ae" }}>
                  あなたのプロフィールに表示します
                </Typography>
              </Box>
            }
          />

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={close} disabled={submitting} sx={{ color: "#cfd8dc" }}>
          キャンセル
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          作成
        </Button>
      </DialogActions>
    </Dialog>
  );
}
