import { Request, Response } from "express";
import * as commentService from "../services/commentService";

// 投稿のコメント一覧を取得
export async function getCommentsByPostId(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const comments = await commentService.getCommentsByPostId(postId);
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
}

// コメントを作成
export async function createComment(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const { text, username, userId, parentId, avatarUrl } = req.body;

    if (!text || !username || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const comment = await commentService.createComment(postId, {
      text,
      username,
      userId,
      parentId,
      avatarUrl
    });

    res.status(201).json(comment);
  } catch (error: any) {
    console.error("Error creating comment:", error);
    if (error.message === 'Post not found' || error.message === 'Parent comment not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create comment" });
  }
}

// コメントを更新
export async function updateComment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { text, userId } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const comment = await commentService.updateComment(id, text, userId);
    res.json(comment);
  } catch (error: any) {
    console.error("Error updating comment:", error);
    if (error.message === 'Comment not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Not authorized to update this comment') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update comment" });
  }
}

// コメントを削除
export async function deleteComment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    await commentService.deleteComment(id, userId);
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    if (error.message === 'Comment not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Not authorized to delete this comment') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to delete comment" });
  }
}

// コメントにいいね/低評価
export async function toggleCommentReaction(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId, reaction } = req.body;

    if (!userId || !reaction) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const comment = await commentService.toggleCommentReaction(id, userId, reaction);
    res.json(comment);
  } catch (error: any) {
    console.error("Error toggling comment reaction:", error);
    if (error.message === 'Comment not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to toggle reaction" });
  }
}
