import { Request, Response } from "express";
import { meiliIndex, meiliCommunityIndex } from "../services/meilisearch";
import { db } from "../services/db";

export async function searchAll(req: Request, res: Response) {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.json({ posts: [], communities: [] });
    }

    const searchLimit = Math.min(parseInt(limit as string) || 10, 50);

    // Search posts
    const postsResult = await meiliIndex.search(q, {
      limit: searchLimit,
      attributesToRetrieve: ['objectID', 'title', 'content', 'username', 'communitySlug'],
      attributesToHighlight: ['title', 'content']
    });

    // Search communities
    const communitiesResult = await meiliCommunityIndex.search(q, {
      limit: searchLimit,
      attributesToRetrieve: ['objectID', 'displayName', 'slug', 'iconUrl', 'description'],
      attributesToHighlight: ['displayName', 'description']
    });

    res.json({
      posts: postsResult.hits,
      communities: communitiesResult.hits
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
}

// Function to add/update a post in the search index
export async function indexPost(postData: any) {
  try {
    await meiliIndex.addDocuments([postData]);
  } catch (error) {
    console.error('Error indexing post:', error);
  }
}

// Function to add/update a community in the search index
export async function indexCommunity(communityData: any) {
  try {
    await meiliCommunityIndex.addDocuments([communityData]);
  } catch (error) {
    console.error('Error indexing community:', error);
  }
}

// Function to delete a post from the search index
export async function deletePost(postId: string) {
  try {
    await meiliIndex.deleteDocument(postId);
  } catch (error) {
    console.error('Error deleting post from index:', error);
  }
}

// Function to delete a community from the search index
export async function deleteCommunity(communityId: string) {
  try {
    await meiliCommunityIndex.deleteDocument(communityId);
  } catch (error) {
    console.error('Error deleting community from index:', error);
  }
}

// Function to migrate existing communities from Firestore to Meilisearch
export async function migrateCommunities(req: Request, res: Response) {
  try {
    const communitiesSnapshot = await db.collection('communities').get();
    const communities: any[] = [];
    
    communitiesSnapshot.forEach((doc) => {
      const data = doc.data();
      communities.push({
        objectID: doc.id,
        displayName: data.displayName || data.name,
        slug: data.slug,
        description: data.description,
        iconUrl: data.iconUrl || data.avatar,
        createdAt: data.createdAt,
        memberCount: data.memberCount || 0
      });
    });

    if (communities.length > 0) {
      await meiliCommunityIndex.addDocuments(communities);
    }

    res.json({ 
      message: 'Communities migrated successfully',
      count: communities.length,
      communities: communities
    });
  } catch (error) {
    console.error('Error migrating communities:', error);
    res.status(500).json({ error: 'Failed to migrate communities' });
  }
}
