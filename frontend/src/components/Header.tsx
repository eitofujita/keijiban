import { useState, useRef, useEffect } from "react";
import type { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import "./Header.css";

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

  // 👇 外をクリックしたら閉じる処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="app-header">
      <div className="header-content">
        {/* メニューボタン */}
        <button className="menu-button" onClick={toggleSidebar}>
          ☰
        </button>

        {/* 検索フォーム */}
        <form className="search-form" onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="検索..." className="search-input" />
          <button type="submit" className="search-button"></button>
        </form>

        {/* プロフィールアイコン */}
        <div className="profile-wrapper" ref={menuRef}>
          <img
            src="/avatar.png"
            alt="Avatar"
            className="avatar"
            onClick={toggleMenu}
          />
          {menuOpen && (
            <div className="dropdown-menu">
              {user ? (
                <>
                  <a href="/profile">プロフィールを見る</a>
                  <a href="/settings">設定</a>
                  <div onClick={handleLogout}>ログアウト</div>
                </>
              ) : (
                <Link to="/login">ログイン</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
