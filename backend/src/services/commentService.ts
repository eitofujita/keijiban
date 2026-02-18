import { Comment } from "../models/Comment";
import { Post } from "../models/Post";

export interface CommentData {
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
  createdAt: Date;
  updatedAt?: Date;
}

// 投稿のコメント一覧を取得
export async function getCommentsByPostId(postId: string): Promise<CommentData[]> {
  const comments = await Comment.find({ postId })
    .sort({ createdAt: 1 })
    .lean();

  return comments.map(comment => ({
    _id: comment._id.toString(),
    text: comment.text,
    username: comment.username,
    userId: comment.userId,
    postId: comment.postId.toString(),
    parentId: comment.parentId?.toString() || null,
    likes: comment.likes,
    dislikes: comment.dislikes,
    likedBy: comment.likedBy,
    dislikedBy: comment.dislikedBy,
    avatarUrl: comment.avatarUrl,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt
  }));
}

// コメントを作成
export async function createComment(postId: string, commentData: {
  text: string;
  username: string;
  userId: string;
  parentId?: string | null;
  avatarUrl?: string;
}): Promise<CommentData> {
  // 投稿が存在するか確認
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  // 親コメントが存在するか確認（parentIdが指定されている場合）
  if (commentData.parentId) {
    const parentComment = await Comment.findById(commentData.parentId);
    if (!parentComment) {
      throw new Error('Parent comment not found');
    }
  }

  const newCommentData = {
    text: commentData.text.trim(),
    username: commentData.username,
    userId: commentData.userId,
    postId,
    parentId: commentData.parentId || null,
    avatarUrl: commentData.avatarUrl || "",
    likes: 0,
    dislikes: 0,
    likedBy: [],
    dislikedBy: [],
  };

  const newComment = await Comment.create(newCommentData);

  // 投稿のコメント数を増やす
  await Post.findByIdAndUpdate(postId, { $inc: { comments: 1 } });

  return {
    _id: newComment._id.toString(),
    text: newComment.text,
    username: newComment.username,
    userId: newComment.userId,
    postId: newComment.postId.toString(),
    parentId: newComment.parentId?.toString() || null,
    likes: newComment.likes,
    dislikes: newComment.dislikes,
    likedBy: newComment.likedBy,
    dislikedBy: newComment.dislikedBy,
    avatarUrl: newComment.avatarUrl,
    createdAt: newComment.createdAt,
    updatedAt: newComment.updatedAt
  };
}

// コメントを更新
export async function updateComment(commentId: string, text: string, userId: string): Promise<CommentData> {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }

  // ユーザーがコメントの所有者か確認
  if (comment.userId !== userId) {
    throw new Error('Not authorized to update this comment');
  }

  comment.text = text.trim();
  await comment.save();

  return {
    _id: comment._id.toString(),
    text: comment.text,
    username: comment.username,
    userId: comment.userId,
    postId: comment.postId.toString(),
    parentId: comment.parentId?.toString() || null,
    likes: comment.likes,
    dislikes: comment.dislikes,
    likedBy: comment.likedBy,
    dislikedBy: comment.dislikedBy,
    avatarUrl: comment.avatarUrl,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt
  };
}

// コメントを削除
export async function deleteComment(commentId: string, userId: string): Promise<void> {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }

  // ユーザーがコメントの所有者か確認
  if (comment.userId !== userId) {
    throw new Error('Not authorized to delete this comment');
  }

  // 子コメントの数を取得
  const childCommentsCount = await Comment.countDocuments({ parentId: commentId });

  // 子コメントも削除
  await Comment.deleteMany({ parentId: commentId });

  // コメントを削除
  await Comment.findByIdAndDelete(commentId);

  // 投稿のコメント数を減らす（子コメントも含めて：1 + 子コメント数）
  const totalDeleted = 1 + childCommentsCount;
  await Post.findByIdAndUpdate(comment.postId, { $inc: { comments: -totalDeleted } });
}

// コメントにいいね/低評価
export async function toggleCommentReaction(commentId: string, userId: string, reaction: 'like' | 'dislike'): Promise<CommentData> {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }

  const isLiked = comment.likedBy.includes(userId);
  const isDisliked = comment.dislikedBy.includes(userId);

  if (reaction === "like") {
    if (isLiked) {
      // いいねを解除
      comment.likedBy = comment.likedBy.filter((id) => id !== userId);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // いいねを追加
      comment.likedBy.push(userId);
      comment.likes += 1;
      // 低評価を解除
      if (isDisliked) {
        comment.dislikedBy = comment.dislikedBy.filter((id) => id !== userId);
        comment.dislikes = Math.max(0, comment.dislikes - 1);
      }
    }
  } else if (reaction === "dislike") {
    if (isDisliked) {
      // 低評価を解除
      comment.dislikedBy = comment.dislikedBy.filter((id) => id !== userId);
      comment.dislikes = Math.max(0, comment.dislikes - 1);
    } else {
      // 低評価を追加
      comment.dislikedBy.push(userId);
      comment.dislikes += 1;
      // いいねを解除
      if (isLiked) {
        comment.likedBy = comment.likedBy.filter((id) => id !== userId);
        comment.likes = Math.max(0, comment.likes - 1);
      }
    }
  }

  await comment.save();

  return {
    _id: comment._id.toString(),
    text: comment.text,
    username: comment.username,
    userId: comment.userId,
    postId: comment.postId.toString(),
    parentId: comment.parentId?.toString() || null,
    likes: comment.likes,
    dislikes: comment.dislikes,
    likedBy: comment.likedBy,
    dislikedBy: comment.dislikedBy,
    avatarUrl: comment.avatarUrl,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt
  };
}
