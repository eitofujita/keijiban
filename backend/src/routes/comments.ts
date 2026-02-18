import { Router } from "express";
import {
  getCommentsByPostId,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentReaction,
} from "../controllers/commentController";

const router = Router();

// 投稿のコメント一覧を取得
router.get("/posts/:postId", getCommentsByPostId);

// コメントを作成
router.post("/posts/:postId", createComment);

// コメントを更新
router.patch("/:id", updateComment);

// コメントを削除
router.delete("/:id", deleteComment);

// コメントにいいね/低評価
router.post("/:id/reaction", toggleCommentReaction);

export default router;
