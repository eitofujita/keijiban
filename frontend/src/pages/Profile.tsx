import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Container,
} from "@mui/material";

type Post = {
  id: string;
  title: string;
  content: string;
};

const Profile = () => {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFetching, setIsFetching] = useState(true);

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
    return (
      <Box
        sx={{
          backgroundColor: "#121212",
          color: "#fff",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress color="inherit" />
        <Typography sx={{ ml: 2 }}>認証情報を確認中...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          backgroundColor: "#121212",
          color: "#fff",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>ログインしていません。</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#121212", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="md">
        <Typography
          variant="h5"
          sx={{ color: "#fff", fontWeight: "bold", mb: 4 }}
        >
          {user.displayName ?? "ユーザー"} の投稿
        </Typography>

        {isFetching ? (
          <Typography sx={{ color: "#ccc" }}>投稿を読み込み中...</Typography>
        ) : posts.length === 0 ? (
          <Typography sx={{ color: "#ccc" }}>投稿が見つかりません。</Typography>
        ) : (
          posts.map((post) => (
            <Card
              key={post.id}
              sx={{
                backgroundColor: "#1e1e1e",
                color: "#fff",
                mb: 3,
                borderRadius: 2,
                boxShadow: 6,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {post.title}
                </Typography>
                <Typography variant="body1">{post.content}</Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Container>
    </Box>
  );
};

export default Profile;
