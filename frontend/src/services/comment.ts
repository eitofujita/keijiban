const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface Comment {
  _id: string;
  text: string;
  username: string;
  userId: string;
  postId: string;
  parentId?: string | null;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

// 投稿のコメント一覧を取得
export const getCommentsByPostId = async (postId: string): Promise<Comment[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/posts/${postId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// コメントを作成
export const createComment = async (
  postId: string,
  commentData: {
    text: string;
    username: string;
    userId: string;
    parentId?: string | null;
    avatarUrl?: string;
  }
): Promise<Comment> => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/posts/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create comment' }));
      throw new Error(errorData.error || 'Failed to create comment');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

// コメントを更新
export const updateComment = async (
  commentId: string,
  text: string,
  userId: string
): Promise<Comment> => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, userId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update comment' }));
      throw new Error(errorData.error || 'Failed to update comment');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

// コメントを削除
export const deleteComment = async (commentId: string, userId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete comment' }));
      throw new Error(errorData.error || 'Failed to delete comment');
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// コメントにいいね/低評価
export const toggleCommentReaction = async (
  commentId: string,
  userId: string,
  reaction: 'like' | 'dislike'
): Promise<Comment> => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/reaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, reaction }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to toggle reaction' }));
      throw new Error(errorData.error || 'Failed to toggle reaction');
    }
    return await response.json();
  } catch (error) {
    console.error('Error toggling comment reaction:', error);
    throw error;
  }
};
