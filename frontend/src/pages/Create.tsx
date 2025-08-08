import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Create.css";
import { useAuth } from "../hooks/useAuth";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const Create = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user === null) {
      console.log("ログインしていないため、ログインページへ遷移");
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      console.log("❌ ユーザー情報が存在しないため、投稿処理中止");
      return;
    }

    console.log("🟢 投稿処理開始");

    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        uid: user.uid,
        createdAt: new Date(),
      });

      console.log("✅ 投稿成功:", { title, content, uid: user.uid });
      navigate("/"); // ホームに遷移
      console.log("🏠 ホームに遷移しました");
    } catch (error) {
      console.error("❌ 投稿失敗:", error);
      alert("投稿に失敗しました。");
    }
  };

  return (
    <div className="create-container">
      <h2>新しい投稿を作成</h2>
      <form onSubmit={handleSubmit} className="create-form">
        <input
          type="text"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="本文を入力"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit">投稿する</button>
      </form>
    </div>
  );
};

export default Create;
