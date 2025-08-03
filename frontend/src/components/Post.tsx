import { Link } from "react-router-dom";

interface Props {
  id: string;
  title: string;
  content: string;
  upvotes: number;
}

export function Post({ id, title, content, upvotes }: Props) {
  return (
    <div className="post-card">
      <Link to={`/post/${id}`} className="post-title">{title}</Link>
      <div className="post-content">{content}</div>
      <div className="post-upvotes">Upvotes: {upvotes}</div>
    </div>
  );
}