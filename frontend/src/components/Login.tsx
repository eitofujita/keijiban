import { useState } from "react";
import {
  Box, Typography, Container, Paper, TextField, Button,
  IconButton, InputAdornment, Alert, Stack, Link
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginButton from "../components/LoginButton";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";


export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(""); // 新規登録のみ
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string }>();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(undefined);
    setLoading(true);
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setMsg({ type: "success", text: "ログインしました。" });
        navigate("/");
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        // 任意: 表示名セット
        if (displayName) {
          await updateProfile(cred.user, { displayName });
        }
        // 任意: 確認メール送信
        await sendEmailVerification(cred.user);
        setMsg({ type: "success", text: "アカウントを作成しました。確認メールを送信しました。" });
      }
    } catch (err: any) {
      // エラーメッセージ（必要に応じてマップ）
      const map: Record<string, string> = {
        "auth/invalid-email": "メールアドレスの形式が正しくありません。",
        "auth/missing-password": "パスワードを入力してください。",
        "auth/weak-password": "パスワードは6文字以上にしてください。",
        "auth/email-already-in-use": "このメールは既に登録されています。",
        "auth/user-not-found": "ユーザーが見つかりません。",
        "auth/wrong-password": "メールまたはパスワードが違います。",
        "auth/too-many-requests": "試行回数が多すぎます。しばらくしてから再試行してください。",
      };
      setMsg({ type: "error", text: map[err.code] ?? `エラー: ${err.code}` });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) {
      setMsg({ type: "error", text: "パスワード再設定にはメールアドレスが必要です。" });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMsg({ type: "success", text: "パスワード再設定メールを送信しました。" });
    } catch (err: any) {
      setMsg({ type: "error", text: "再設定メール送信に失敗しました。" });
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={4} sx={{ mt: 8, p: 4, borderRadius: 3, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          ログインしてください
        </Typography>

        {msg && (
          <Box mt={2}>
            <Alert severity={msg.type}>{msg.text}</Alert>
          </Box>
        )}

        {/* Google ログイン */}
        <Box mt={3} display="flex" justifyContent="center">
          <LoginButton />
        </Box>

        <Typography mt={3} mb={1} variant="body2" color="text.secondary">
          またはメールで{mode === "signin" ? "ログイン" : "新規登録"}
        </Typography>

        {/* Email/Password フォーム */}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {mode === "signup" && (
              <TextField
                label="表示名（任意）"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                fullWidth
              />
            )}
            <TextField
              label="メールアドレス"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              fullWidth
              required
            />
            <TextField
              label="パスワード"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw((v) => !v)} edge="end" aria-label="toggle password">
                      {showPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ fontWeight: "bold" }}
            >
              {mode === "signin" ? "メールでログイン" : "新規登録"}
            </Button>

            {mode === "signin" && (
              <Link component="button" type="button" onClick={handleReset} sx={{ alignSelf: "flex-end" }}>
                パスワードをお忘れですか？
              </Link>
            )}
          </Stack>
        </Box>

        <Box mt={2}>
          <Link
            component="button"
            type="button"
            onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          >
            {mode === "signin" ? "新規登録はこちら" : "すでにアカウントをお持ちの方はこちら"}
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}
