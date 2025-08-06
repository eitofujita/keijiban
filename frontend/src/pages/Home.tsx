import { Post } from "../components/Post";
import type { User } from "firebase/auth"; // 👈 type-only import
import "./Home.css";

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

const Home = ({ user }: HomeProps) => {
  return (
    <div className="home-container">
      <h1 className="home-title">掲示板</h1>
      <h2>ようこそ、{user?.displayName ?? "ゲスト"} さん！</h2>

      {posts.map((p) => (
        <Post key={p.id} {...p} />
      ))}
    </div>
  );
};

export default Home;
