// backend/src/routes/posts.ts
import { Router } from "express";
import { createPost, updatePost, deletePost, searchPosts, getAllPosts, getPostById, togglePostReaction } from "../controllers/postController";
const router = Router();

router.get("/", getAllPosts);
router.get("/search", searchPosts);
router.get("/:id", getPostById);
router.post("/", createPost);
router.patch("/:id", updatePost);
router.delete("/:id", deletePost);
router.post("/:id/reaction", togglePostReaction);

export default router;
