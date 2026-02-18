import { Request, Response } from "express";
import * as postService from "../services/postService";

// Get post by ID
export async function getPostById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const post = await postService.getPostById(id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
}

// Get all posts from MongoDB
export async function getAllPosts(req: Request, res: Response) {
  try {
    const posts = await postService.getAllPosts();
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
}

export async function createPost(req: Request, res: Response) {
  try {
    const { title, content, username, communitySlug } = req.body;
    
    const post = await postService.createPost({
      title,
      content,
      username,
      communitySlug
    });

    res.status(201).json(post);
  } catch (error: any) {
    console.error('Error creating post:', error);
    if (error.message === 'Community not found') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create post' });
  }
}

export async function updatePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const post = await postService.updatePost(id, { title, content });
    res.json(post);
  } catch (error: any) {
    console.error('Error updating post:', error);
    if (error.message === 'Post not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update post' });
  }
}

export async function deletePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await postService.deletePost(id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting post:', error);
    if (error.message === 'Post not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete post' });
  }
}

export async function searchPosts(req: Request, res: Response) {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.json([]);
    }

    const posts = await postService.searchPosts(q);
    res.json(posts);
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({ error: 'Search failed' });
  }
}

// 投稿にいいね/低評価
export async function togglePostReaction(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId, reaction } = req.body;

    if (!userId || !reaction) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const post = await postService.togglePostReaction(id, userId, reaction);
    res.json(post);
  } catch (error: any) {
    console.error('Error toggling post reaction:', error);
    if (error.message === 'Post not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to toggle reaction' });
  }
}
