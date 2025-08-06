// components/Post.tsx
import { useState } from "react";
import "./Post.css";

type PostProps = {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  username: string;
  timestamp: string;
};

export const Post = ({ id:_7, title, content, upvotes,username,timestamp }: PostProps) => {
  const [likes, setLikes] = useState(upvotes);
  const [dislikes, setDislikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [comments, setComments] = useState<string[]>([]);
  const [commentText, setCommentText] = useState("");
  
 const handleLike = () => {
  if (hasLiked) {
    setLikes((prev) => prev - 1);
    setHasLiked(false);
  } else {
    setLikes((prev) => prev + 1);
    setHasLiked(true);

    if (hasDisliked) {
      setDislikes((prev) => prev - 1);
      setHasDisliked(false);
    }
  }
};



const handleDislike = () => {
  if (hasDisliked) {
    setDislikes((prev) => prev - 1);
    setHasDisliked(false);
  } else {
    setDislikes((prev) => prev + 1);
    setHasDisliked(true);

  
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    }
  }
};




  const handleAddComment = () => {
    if (commentText.trim() !== "") {
      setComments([...comments, commentText]);
      setCommentText("");
    }
  };

  return (

  <div className="post-card">
    
    <div className="post-header">
      <img
        src="/profile.png"
        alt="プロフィール画像"
        className="profile-icon"
      />
      <div className="post-meta">
        <span className="username">{username}</span>
        <span className="dot">•</span>
        <span className="timestamp">{timestamp}</span>
      </div>
    </div>

    <h3 className="post-title">{title}</h3>
    <p className="post-content">{content}</p>

    <div className="post-actions">
      <button className="like-button" onClick={handleLike}>👍 {likes}</button>
      <button className="dislike-button" onClick={handleDislike}>👎 {dislikes}</button>
      <span className="comment-count">💬 {comments.length}</span>
    </div>

    <div className="comment-section">
      <input
        type="text"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="コメントを入力..."
        className="comment-input"
      />
      <button className="comment-submit" onClick={handleAddComment}>
        投稿
      </button>

      <ul className="comment-list">
        {comments.map((c, i) => (
          <li key={i} className="comment-item">・{c}</li>
        ))}
      </ul>
    </div>
  </div>
);

};
