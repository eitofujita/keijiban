// Home.tsx
import { Post } from "../components/Post";
import "./Home.css";

const posts = [
  {
    id: "1",
    title: "はじめての投稿",
    content: "これは最初の投稿です！",
    upvotes: 10,
  },
];

export default function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title"> 掲示板</h1>
      {posts.map((p) => (
        <Post key={p.id} {...p} />
      ))}
    </div>

  );
}
