import { Request, Response } from "express";
import { meiliIndex, meiliCommunityIndex } from "../services/meilisearch";
import { Community } from "../models/Community";

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

// Function to migrate existing communities from MongoDB to Meilisearch
export async function migrateCommunities(req: Request, res: Response) {
  try {
    const communities = await Community.find({});
    
    const communitiesData = communities.map(community => ({
      objectID: community.id,
      displayName: community.displayName,
      slug: community.slug,
      description: community.description,
      iconUrl: community.iconUrl,
      createdAt: community.createdAt,
      memberCount: community.memberCount || 0
    }));

    if (communitiesData.length > 0) {
      await meiliCommunityIndex.addDocuments(communitiesData);
    }

    res.json({ 
      message: 'Communities migrated successfully',
      count: communitiesData.length,
      communities: communitiesData
    });
  } catch (error) {
    console.error('Error migrating communities:', error);
    res.status(500).json({ error: 'Failed to migrate communities' });
  }
}
