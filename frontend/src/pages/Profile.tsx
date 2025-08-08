import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

type Post = {
  id: string;
  title: string;
  content: string;
};

const Profile = () => {
  const { user, loading } = useAuth(); // ✅ 修正ここ！

  const [posts, setPosts] = useState<Post[]>([]);
  const [isFetching, setIsFetching] = useState(true); // 投稿取得中フラグ

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "posts"),
          where("uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);

        const userPosts: Post[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title ?? "(タイトルなし)",
            content: data.content ?? "(内容なし)",
          };
        });

        setPosts(userPosts);
      } catch (error) {
        console.error("投稿の取得に失敗しました:", error);
      } finally {
        setIsFetching(false);
      }
    };

    if (!loading && user) {
      fetchPosts();
    }
  }, [user, loading]);

  if (loading) {
    return <p>認証情報を確認中...</p>;
  }

  if (!user) {
    return <p>ログインしていません。</p>;
  }

  return (
    <div className="profile-container">
      <h2>{user.displayName ?? "ユーザー"} の投稿</h2>

      {isFetching ? (
        <p>投稿を読み込み中...</p>
      ) : posts.length === 0 ? (
        <p>投稿が見つかりません。</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="post-card">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Profile;
