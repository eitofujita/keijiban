// backend/src/routes/posts.ts
import { Router } from "express";
import { createPost, updatePost, deletePost, searchPosts, getAllPosts } from "../controllers/postController";
const router = Router();

router.get("/", getAllPosts);
router.post("/", createPost);
router.patch("/:id", updatePost);
router.delete("/:id", deletePost);
router.get("/search", searchPosts);

export default router;
