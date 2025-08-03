import { useState } from "react";
import "./Header.css";


interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen)
  return (
    <header className="app-header">
      <div className="header-content">
        {/* メニューボタン */}
        <button className="menu-button" onClick={toggleSidebar}>
          ☰
        </button>

        {/* 検索フォーム */}
        <form className="search-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="検索..."
            className="search-input"
          />
          <button type="submit" className="search-button"></button>
        </form>
        {/* プロフィールアイコン */}
        <div className="profile-wrapper">
          <img
            src="/path/to/avatar.png"
            alt="Avatar"
            className="avatar"
            onClick={toggleMenu}
          />
          {menuOpen && (
            <div className="profile-menu">
              <a href="/profile">プロフィールを見る</a>
              <a href="/settings">設定</a>
              <a href="/logout">ログアウト</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
