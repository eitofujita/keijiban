import { useState, useRef, useEffect } from "react";
import type { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Avatar,
  Typography,
  Paper,
} from "@mui/material";

type HeaderProps = {
  toggleSidebar: () => void;
  user: User | null;
};

export default function Header({ toggleSidebar, user }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    signOut(auth).catch((error) => console.error(error));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        backgroundColor: "#1e1e1e", // ダークカラー
        padding: "10px 20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        maxWidth="1200px"
        margin="0 auto"
        color="#f0f0f0"
      >
        {/* メニュー */}
        <Button onClick={toggleSidebar} variant="outlined" sx={{ color: "#f0f0f0", borderColor: "#777" }}>
          ☰
        </Button>

        {/* 検索バー */}
        <Box component="form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="検索..."
            style={{
              padding: "6px 10px",
              borderRadius: "20px",
              border: "1px solid #555",
              backgroundColor: "#2c2c2c",
              color: "#fff",
              outline: "none",
            }}
          />
        </Box>

        {/* 投稿・ログイン・プロフィール */}
        <Box display="flex" alignItems="center" gap={2} ref={menuRef}>
          <Link to="/create" style={{ textDecoration: "none" }}>
            <Button variant="contained" color="error">
             ポスト
            </Button>
          </Link>

          {user ? (
            <>
              <Avatar
                src={user.photoURL || "/avatar.png"}
                alt="avatar"
                sx={{ cursor: "pointer" }}
                onClick={toggleMenu}
              />

              {menuOpen && (
                <Paper
                  elevation={3}
                  sx={{
                    position: "absolute",
                    top: "60px",
                    right: "20px",
                    width: 180,
                    padding: 1,
                    borderRadius: 2,
                    zIndex: 1001,
                    backgroundColor: "#2e2e2e",
                    color: "#fff",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    {user.displayName || "ユーザー"}
                  </Typography>
                  <Link to="/profile" style={{ textDecoration: "none" }}>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, cursor: "pointer", color: "#61dafb" }}
                    >
                      プロフィールを見る
                    </Typography>
                  </Link>
                  <Typography
                    variant="body2"
                    sx={{ cursor: "pointer", color: "#f44336" }}
                    onClick={handleLogout}
                  >
                    ログアウト
                  </Typography>
                </Paper>
              )}
            </>
          ) : (
            <Link to="/login" style={{ textDecoration: "none" }}>
              <Button variant="contained" color="primary">
                ログイン
              </Button>
            </Link>
          )}
        </Box>
      </Box>
    </Box>
  );
}
