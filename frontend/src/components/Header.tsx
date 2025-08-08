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

  // 外クリックでメニューを閉じる
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
    <header className="app-header">
      <div className="header-content">
        {/* 左：メニューボタン */}
        <div className="header-left">
          <button className="menu-button" onClick={toggleSidebar}>☰</button>
        </div>

        {/* 中央：検索フォーム */}
        <div className="header-center">
          <form className="search-form" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="検索..." className="search-input" />
            <button type="submit" className="search-button"></button>
          </form>
        </div>

        {/* 右：Createボタン + アバター + メニュー */}
        <div className="header-right profile-wrapper" ref={menuRef}>
          <Link to="/create" className="create-button">
            作成＋
          </Link>

          <img
            src={user?.photoURL || "/avatar.png"}
            alt="Avatar"
            className="avatar"
            onClick={toggleMenu}
          />

          {menuOpen && (
            <div className="profile-menu">
              {user ? (
                <>
                  <div className="profile-item">{user.displayName}</div>
                  <Link className="profile-item" to="/profile">
                         View Profile
                   </Link>
                  <div className="profile-item logout" onClick={handleLogout}>
                    ログアウト
                  </div>

                </>
              ) : (
                <Link className="profile-item" to="/login">ログイン</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
