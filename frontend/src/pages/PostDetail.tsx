import { useParams } from "react-router-dom";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">投稿の詳細</h1>
      <p>これは投稿 ID {id} の詳細ページです。</p>
    </div>
  );
}
