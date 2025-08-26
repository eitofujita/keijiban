import { Request, Response } from "express";
import { indexPost, deletePost as deleteFromIndex } from "./searchController";
import { db } from "../services/db";

// Get all posts from Firestore
export async function getAllPosts(req: Request, res: Response) {
  try {
    // Get all communities first to check which ones exist
    const communitiesSnapshot = await db.collection('communities').get();
    const existingCommunitySlugs = new Set();
    
    communitiesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.slug) {
        existingCommunitySlugs.add(data.slug);
      }
    });

    // Get all posts and filter out those from deleted communities
    const postsSnapshot = await db.collection('posts').get();
    const posts: any[] = [];
    
    postsSnapshot.forEach((doc) => {
      const data = doc.data();
      // Only include posts from existing communities
      if (data.communitySlug && existingCommunitySlugs.has(data.communitySlug)) {
        posts.push({
          objectID: doc.id,
          title: data.title,
          content: data.content,
          username: data.username,
          communitySlug: data.communitySlug,
          createdAt: data.createdAt,
          likes: data.likes || 0,
          dislikes: data.dislikes || 0,
          comments: data.comments || 0
        });
      }
    });

    // Sort by creation date (newest first)
    posts.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
}

export async function createPost(req: Request, res: Response) {
  try {
    const { title, content, username, communitySlug } = req.body;
    
    // Check if community exists
    const communitySnapshot = await db.collection('communities')
      .where('slug', '==', communitySlug)
      .get();
    
    if (communitySnapshot.empty) {
      return res.status(400).json({ error: 'Community not found' });
    }
    
    const postData = {
      title,
      content,
      username,
      communitySlug,
      createdAt: new Date(),
      likes: 0,
      dislikes: 0,
      comments: 0
    };

    const docRef = await db.collection('posts').add(postData);
    
    const newPost = {
      objectID: docRef.id,
      ...postData
    };

    // Index in Meilisearch
    await indexPost(newPost);

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
}

export async function updatePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const postDoc = await db.collection('posts').doc(id).get();
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const updateData = {
      title,
      content,
      updatedAt: new Date()
    };

    await db.collection('posts').doc(id).update(updateData);
    
    // Get updated post
    const updatedPostDoc = await db.collection('posts').doc(id).get();
    const data = updatedPostDoc.data();
    
    const updatedPost = {
      objectID: updatedPostDoc.id,
      title: data?.title,
      content: data?.content,
      username: data?.username,
      communitySlug: data?.communitySlug,
      createdAt: data?.createdAt,
      likes: data?.likes || 0,
      dislikes: data?.dislikes || 0,
      comments: data?.comments || 0
    };

    // Update in Meilisearch
    await indexPost(updatedPost);

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
}

export async function deletePost(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const postDoc = await db.collection('posts').doc(id).get();
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Delete from Firestore
    await db.collection('posts').doc(id).delete();

    // Remove from Meilisearch
    await deleteFromIndex(id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
}

export async function searchPosts(req: Request, res: Response) {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.json([]);
    }

    // Get all communities first to check which ones exist
    const communitiesSnapshot = await db.collection('communities').get();
    const existingCommunitySlugs = new Set();
    
    communitiesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.slug) {
        existingCommunitySlugs.add(data.slug);
      }
    });

    // Search posts and filter out those from deleted communities
    const postsSnapshot = await db.collection('posts').get();
    const posts: any[] = [];
    
    postsSnapshot.forEach((doc) => {
      const data = doc.data();
      // Only include posts from existing communities
      if (data.communitySlug && existingCommunitySlugs.has(data.communitySlug)) {
        const postText = `${data.title || ''} ${data.content || ''}`.toLowerCase();
        if (postText.includes(q.toLowerCase())) {
          posts.push({
            objectID: doc.id,
            title: data.title,
            content: data.content,
            username: data.username,
            communitySlug: data.communitySlug,
            createdAt: data.createdAt
          });
        }
      }
    });

    res.json(posts);
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({ error: 'Search failed' });
  }
}
