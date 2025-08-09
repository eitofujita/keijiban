import { Post } from "../components/Post";
import type { User } from "firebase/auth";
import { Container, Typography, Box } from "@mui/material";

const posts = [
  {
    id: "1",
    title: "はじめての投稿",
    content: "これは最初の投稿です！",
    upvotes: 10,
    username: "r/myboard",
    timestamp: "2 hours ago"
  },
  {
    id: "2",
    title: "別の投稿",
    content: "こんにちは",
    upvotes: 3,
    username: "r/guestuser",
    timestamp: "5 minutes ago"
  }
];

type HomeProps = {
  user: User | null;
};

const Home = ({ user: _user }: HomeProps) => {
  return (
    <Box sx={{ backgroundColor: "#121212", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          sx={{ color: "#ffffff", fontWeight: "bold", mb: 4 }}
        >
          投稿一覧
        </Typography>

        {posts.map((p) => (
          <Post key={p.id} {...p} />
        ))}
      </Container>
    </Box>
  );
};

export default Home;
