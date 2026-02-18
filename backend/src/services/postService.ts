import { Post } from "../models/Post";
import { Community } from "../models/Community";
import { indexPost, deletePost as deleteFromIndex } from "../controllers/searchController";

export interface PostData {
  objectID: string;
  title: string;
  content: string;
  username: string;
  communitySlug: string;
  communityName?: string;
  communityIcon?: string;
  createdAt: Date;
  likes: number;
  dislikes: number;
  comments: number;
  likedBy: string[];
  dislikedBy: string[];
}

// 投稿をIDで取得
export async function getPostById(id: string): Promise<PostData | null> {
  const post = await Post.findById(id);
  
  if (!post) {
    return null;
  }

  // Get community info
  const community = await Community.findOne({ slug: post.communitySlug });

  return {
    objectID: post.id,
    title: post.title,
    content: post.content,
    username: post.username,
    communitySlug: post.communitySlug,
    communityName: community?.displayName || post.communitySlug,
    communityIcon: community?.iconUrl || "",
    createdAt: post.createdAt,
    likes: post.likes || 0,
    dislikes: post.dislikes || 0,
    comments: post.comments || 0,
    likedBy: post.likedBy || [],
    dislikedBy: post.dislikedBy || []
  };
}

// すべての投稿を取得
export async function getAllPosts(): Promise<PostData[]> {
  // Get all existing community slugs
  const communities = await Community.find({}).select('slug');
  const existingCommunitySlugs = new Set(
    communities.map(c => c.slug)
  );

  // Get all posts from existing communities
  const posts = await Post.find({
    communitySlug: { $in: Array.from(existingCommunitySlugs) }
  }).sort({ createdAt: -1 });

  return posts.map(post => ({
    objectID: post.id,
    title: post.title,
    content: post.content,
    username: post.username,
    communitySlug: post.communitySlug,
    createdAt: post.createdAt,
    likes: post.likes || 0,
    dislikes: post.dislikes || 0,
    comments: post.comments || 0,
    likedBy: post.likedBy || [],
    dislikedBy: post.dislikedBy || []
  }));
}

// 投稿を作成
export async function createPost(postData: {
  title: string;
  content: string;
  username: string;
  communitySlug: string;
}): Promise<PostData> {
  // Check if community exists
  const community = await Community.findOne({ slug: postData.communitySlug });
  
  if (!community) {
    throw new Error('Community not found');
  }
  
  const newPostData = {
    title: postData.title,
    content: postData.content,
    username: postData.username,
    communitySlug: postData.communitySlug,
    likes: 0,
    dislikes: 0,
    comments: 0
  };

  const newPost = await Post.create(newPostData);
  
  const postResponse: PostData = {
    objectID: newPost.id,
    title: newPost.title,
    content: newPost.content,
    username: newPost.username,
    communitySlug: newPost.communitySlug,
    createdAt: newPost.createdAt,
    likes: newPost.likes,
    dislikes: newPost.dislikes,
    comments: newPost.comments,
    likedBy: newPost.likedBy || [],
    dislikedBy: newPost.dislikedBy || []
  };

  // Index in Meilisearch
  await indexPost(postResponse);

  return postResponse;
}

// 投稿を更新
export async function updatePost(id: string, postData: {
  title: string;
  content: string;
}): Promise<PostData> {
  const post = await Post.findById(id);
  if (!post) {
    throw new Error('Post not found');
  }

  post.title = postData.title;
  post.content = postData.content;
  await post.save();
  
  const updatedPost: PostData = {
    objectID: post.id,
    title: post.title,
    content: post.content,
    username: post.username,
    communitySlug: post.communitySlug,
    createdAt: post.createdAt,
    likes: post.likes || 0,
    dislikes: post.dislikes || 0,
    comments: post.comments || 0,
    likedBy: post.likedBy || [],
    dislikedBy: post.dislikedBy || []
  };

  // Update in Meilisearch
  await indexPost(updatedPost);

  return updatedPost;
}

// 投稿を削除
export async function deletePost(id: string): Promise<void> {
  const post = await Post.findById(id);
  if (!post) {
    throw new Error('Post not found');
  }

  // Delete from MongoDB
  await Post.findByIdAndDelete(id);

  // Remove from Meilisearch
  await deleteFromIndex(id);
}

// 投稿にいいね/低評価
export async function togglePostReaction(id: string, userId: string, reaction: 'like' | 'dislike'): Promise<PostData> {
  const post = await Post.findById(id);
  if (!post) {
    throw new Error('Post not found');
  }

  const isLiked = post.likedBy?.includes(userId) || false;
  const isDisliked = post.dislikedBy?.includes(userId) || false;

  if (reaction === 'like') {
    if (isLiked) {
      // いいねを解除
      post.likedBy = post.likedBy.filter((uid: string) => uid !== userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // いいねを追加
      if (!post.likedBy) post.likedBy = [];
      post.likedBy.push(userId);
      post.likes += 1;
      // 低評価を解除
      if (isDisliked) {
        post.dislikedBy = post.dislikedBy.filter((uid: string) => uid !== userId);
        post.dislikes = Math.max(0, post.dislikes - 1);
      }
    }
  } else if (reaction === 'dislike') {
    if (isDisliked) {
      // 低評価を解除
      post.dislikedBy = post.dislikedBy.filter((uid: string) => uid !== userId);
      post.dislikes = Math.max(0, post.dislikes - 1);
    } else {
      // 低評価を追加
      if (!post.dislikedBy) post.dislikedBy = [];
      post.dislikedBy.push(userId);
      post.dislikes += 1;
      // いいねを解除
      if (isLiked) {
        post.likedBy = post.likedBy.filter((uid: string) => uid !== userId);
        post.likes = Math.max(0, post.likes - 1);
      }
    }
  }

  await post.save();

  const postResponse: PostData = {
    objectID: post.id,
    title: post.title,
    content: post.content,
    username: post.username,
    communitySlug: post.communitySlug,
    createdAt: post.createdAt,
    likes: post.likes || 0,
    dislikes: post.dislikes || 0,
    comments: post.comments || 0,
    likedBy: post.likedBy || [],
    dislikedBy: post.dislikedBy || []
  };

  // Update in Meilisearch
  await indexPost(postResponse);

  return postResponse;
}

// 投稿を検索
export async function searchPosts(query: string): Promise<PostData[]> {
  // Get all existing community slugs
  const communities = await Community.find({}).select('slug');
  const existingCommunitySlugs = new Set(
    communities.map(c => c.slug)
  );

  // Search posts using MongoDB text search or regex
  const posts = await Post.find({
    communitySlug: { $in: Array.from(existingCommunitySlugs) },
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } }
    ]
  });

  return posts.map(post => ({
    objectID: post.id,
    title: post.title,
    content: post.content,
    username: post.username,
    communitySlug: post.communitySlug,
    createdAt: post.createdAt,
    likes: post.likes || 0,
    dislikes: post.dislikes || 0,
    comments: post.comments || 0,
    likedBy: post.likedBy || [],
    dislikedBy: post.dislikedBy || []
  }));
}
