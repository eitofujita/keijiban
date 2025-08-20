import { useState, useRef, useEffect } from "react";
import type { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Avatar,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import logo from "../assets/anime.png";
import MenuIcon from "@mui/icons-material/Menu";
import SearchBox from "./SearchBox"; // ← 追加

type HeaderProps = {
  toggleSidebar: () => void;
  user: User | null;
};

export default function Header({ toggleSidebar, user }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const handleLogout = () => signOut(auth).catch(console.error);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#121212" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* 左側 */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            edge="start"
            onClick={toggleSidebar}
            sx={{ color: "#fff", mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* ロゴ */}
          <Box
            component="img"
            src={logo}
            alt="Anime Reviews Logo"
            onClick={() => navigate("/")}
            sx={{
              height: 40,
              width: "auto",
              ml: 1,
              cursor: "pointer",
            }}
          />
        </Box>

        {/* 🔹中央：SearchBoxを挿入 */}
        <Box>
          <SearchBox />
        </Box>

        {/* 右側 */}
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
      </Toolbar>
    </AppBar>
  );
}
