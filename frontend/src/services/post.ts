const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface Post {
  objectID: string;
  title: string;
  content: string;
  username: string;
  communitySlug: string;
  communityName?: string;
  communityIcon?: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  comments: number;
  likedBy?: string[];
  dislikedBy?: string[];
}

// すべての投稿を取得
export const getAllPosts = async (): Promise<Post[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// 投稿をIDで取得
export const getPostById = async (postId: string): Promise<Post> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch post');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

// 投稿を作成
export const createPost = async (postData: {
  title: string;
  content: string;
  username: string;
  communitySlug: string;
}): Promise<Post> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create post' }));
      throw new Error(errorData.error || 'Failed to create post');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// 投稿を更新
export const updatePost = async (
  postId: string,
  postData: { title: string; content: string }
): Promise<Post> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update post' }));
      throw new Error(errorData.error || 'Failed to update post');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// 投稿を削除
export const deletePost = async (postId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete post' }));
      throw new Error(errorData.error || 'Failed to delete post');
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// 投稿にいいね/低評価
export const togglePostReaction = async (
  postId: string,
  userId: string,
  reaction: 'like' | 'dislike'
): Promise<Post> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/reaction`, {
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
    console.error('Error toggling post reaction:', error);
    throw error;
  }
};

// コミュニティの投稿を取得
export const getPostsByCommunitySlug = async (communitySlug: string): Promise<Post[]> => {
  try {
    const allPosts = await getAllPosts();
    return allPosts.filter(post => post.communitySlug === communitySlug);
  } catch (error) {
    console.error('Error fetching posts by community:', error);
    throw error;
  }
};

// ユーザーの投稿を取得
export const getPostsByUsername = async (username: string): Promise<Post[]> => {
  try {
    const allPosts = await getAllPosts();
    return allPosts.filter(post => post.username === username);
  } catch (error) {
    console.error('Error fetching posts by username:', error);
    throw error;
  }
};
