import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import { FaBars } from "react-icons/fa";
import Login from "./components/Login";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import type { User } from "firebase/auth";

function App() {
  const [isSidebarOpen, setSidebaropen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 🔸 ローディング状態を追加

  const toggleSidebar = () => setSidebaropen((prev) => !prev);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false); // 🔸 ローディング終了
    });
    return () => unsubscribe();
  }, []); // ← useEffect に依存配列が抜けてたので追加！

  if (loading) {
    return <div>Loading...</div>; // 🔸 読み込み中の表示
  }

  return (
    <Router>
      <button className="hamburger-fixed" onClick={toggleSidebar}>
        <FaBars size={24} />
      </button>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Header toggleSidebar={toggleSidebar} />
        <div style={{ display: "flex", flex: 1 }}>
          <Sidebar isOpen={isSidebarOpen} toggleMenu={toggleSidebar} />
          <main style={{ flex: 1, padding: "1rem" }}>
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
