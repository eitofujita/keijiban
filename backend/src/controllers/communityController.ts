import { Request, Response } from "express";
import { db } from "../services/db";
import { indexCommunity } from "./searchController";

// Get all communities from Firestore
export async function getAllCommunities(req: Request, res: Response) {
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
        memberCount: data.memberCount || 0,
        hostId: data.hostId
      });
    });

    res.json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
}

// Get a single community by ID
export async function getCommunityById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const communityDoc = await db.collection('communities').doc(id).get();
    
    if (!communityDoc.exists) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const data = communityDoc.data();
    const community = {
      objectID: communityDoc.id,
      displayName: data?.displayName || data?.name,
      slug: data?.slug,
      description: data?.description,
      iconUrl: data?.iconUrl || data?.avatar,
      createdAt: data?.createdAt,
      memberCount: data?.memberCount || 0,
      hostId: data?.hostId
    };

    res.json(community);
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ error: 'Failed to fetch community' });
  }
}

// Create a new community
export async function createCommunity(req: Request, res: Response) {
  try {
    const { displayName, slug, description, iconUrl, hostId } = req.body;
    
    const communityData = {
      displayName,
      slug,
      description,
      iconUrl,
      hostId,
      createdAt: new Date().toISOString(),
      memberCount: 1 // Host is the first member
    };

    const docRef = await db.collection('communities').add(communityData);
    
    const newCommunity = {
      objectID: docRef.id,
      ...communityData
    };

    // Add host as first member
    await db.collection('communities').doc(docRef.id)
      .collection('members').doc(hostId).set({
        userId: hostId,
        role: 'host',
        joinedAt: new Date().toISOString()
      });

    // Index in Meilisearch
    await indexCommunity(newCommunity);

    res.status(201).json(newCommunity);
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ error: 'Failed to create community' });
  }
}

// Update a community
export async function updateCommunity(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { displayName, description, iconUrl } = req.body;

    const updateData = {
      displayName,
      description,
      iconUrl,
      updatedAt: new Date().toISOString()
    };

    await db.collection('communities').doc(id).update(updateData);
    
    // Get updated community
    const communityDoc = await db.collection('communities').doc(id).get();
    const data = communityDoc.data();
    
    const updatedCommunity = {
      objectID: communityDoc.id,
      displayName: data?.displayName,
      slug: data?.slug,
      description: data?.description,
      iconUrl: data?.iconUrl,
      createdAt: data?.createdAt,
      memberCount: data?.memberCount || 0,
      hostId: data?.hostId
    };

    // Update in Meilisearch
    await indexCommunity(updatedCommunity);

    res.json(updatedCommunity);
  } catch (error) {
    console.error('Error updating community:', error);
    res.status(500).json({ error: 'Failed to update community' });
  }
}

// Delete a community and all its posts
export async function deleteCommunity(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Get community info before deletion
    const communityDoc = await db.collection('communities').doc(id).get();
    if (!communityDoc.exists) {
      return res.status(404).json({ error: 'Community not found' });
    }
    
    const communityData = communityDoc.data();
    const communitySlug = communityData?.slug;
    
    // Delete all posts in this community
    if (communitySlug) {
      const postsSnapshot = await db.collection('posts')
        .where('communitySlug', '==', communitySlug)
        .get();
      
      const deletePromises = postsSnapshot.docs.map(doc => {
        // Delete post from Meilisearch
        deletePostFromIndex(doc.id);
        // Delete post from Firestore
        return doc.ref.delete();
      });
      
      await Promise.all(deletePromises);
      console.log(`Deleted ${postsSnapshot.docs.length} posts from community: ${communitySlug}`);
    }
    
    // Delete all members
    const membersSnapshot = await db.collection('communities').doc(id)
      .collection('members').get();
    
    const memberDeletePromises = membersSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(memberDeletePromises);
    
    // Delete the community
    await db.collection('communities').doc(id).delete();
    
    // Remove from Meilisearch
    await deleteCommunityFromIndex(id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting community:', error);
    res.status(500).json({ error: 'Failed to delete community' });
  }
}

// Join a community
export async function joinCommunity(req: Request, res: Response) {
  try {
    const { communityId } = req.params;
    const { userId } = req.body;

    // Check if community exists
    const communityDoc = await db.collection('communities').doc(communityId).get();
    if (!communityDoc.exists) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if user is already a member
    const memberDoc = await db.collection('communities').doc(communityId)
      .collection('members').doc(userId).get();
    
    if (memberDoc.exists) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add user as member
    await db.collection('communities').doc(communityId)
      .collection('members').doc(userId).set({
        userId,
        role: 'member',
        joinedAt: new Date().toISOString()
      });

    // Update member count
    const communityData = communityDoc.data();
    const newMemberCount = (communityData?.memberCount || 0) + 1;
    
    await db.collection('communities').doc(communityId).update({
      memberCount: newMemberCount
    });

    res.json({ 
      message: 'Successfully joined community',
      memberCount: newMemberCount
    });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ error: 'Failed to join community' });
  }
}

// Leave a community
export async function leaveCommunity(req: Request, res: Response) {
  try {
    const { communityId } = req.params;
    const { userId } = req.body;

    // Check if community exists
    const communityDoc = await db.collection('communities').doc(communityId).get();
    if (!communityDoc.exists) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if user is a member
    const memberDoc = await db.collection('communities').doc(communityId)
      .collection('members').doc(userId).get();
    
    if (!memberDoc.exists) {
      return res.status(400).json({ error: 'User is not a member' });
    }

    const memberData = memberDoc.data();
    
    // Host cannot leave (must transfer ownership or delete community)
    if (memberData?.role === 'host') {
      return res.status(400).json({ error: 'Host cannot leave community. Transfer ownership or delete community.' });
    }

    // Remove user from members
    await db.collection('communities').doc(communityId)
      .collection('members').doc(userId).delete();

    // Update member count
    const communityData = communityDoc.data();
    const newMemberCount = Math.max(0, (communityData?.memberCount || 0) - 1);
    
    await db.collection('communities').doc(communityId).update({
      memberCount: newMemberCount
    });

    res.json({ 
      message: 'Successfully left community',
      memberCount: newMemberCount
    });
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({ error: 'Failed to leave community' });
  }
}

// Get community members
export async function getCommunityMembers(req: Request, res: Response) {
  try {
    const { communityId } = req.params;
    
    const membersSnapshot = await db.collection('communities').doc(communityId)
      .collection('members').get();
    
    const members: any[] = [];
    membersSnapshot.forEach((doc) => {
      const data = doc.data();
      members.push({
        userId: doc.id,
        role: data?.role || 'member',
        joinedAt: data?.joinedAt
      });
    });

    res.json(members);
  } catch (error) {
    console.error('Error fetching community members:', error);
    res.status(500).json({ error: 'Failed to fetch community members' });
  }
}

// Remove member (host only)
export async function removeMember(req: Request, res: Response) {
  try {
    const { communityId, userId } = req.params;
    const { hostId } = req.body; // Host ID to verify permissions

    // Check if community exists
    const communityDoc = await db.collection('communities').doc(communityId).get();
    if (!communityDoc.exists) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const communityData = communityDoc.data();
    
    // Check if user is host
    if (communityData?.hostId !== hostId) {
      return res.status(403).json({ error: 'Only host can remove members' });
    }

    // Check if user to be removed is host
    if (userId === hostId) {
      return res.status(400).json({ error: 'Host cannot remove themselves' });
    }

    // Check if user is a member
    const memberDoc = await db.collection('communities').doc(communityId)
      .collection('members').doc(userId).get();
    
    if (!memberDoc.exists) {
      return res.status(400).json({ error: 'User is not a member' });
    }

    // Remove user from members
    await db.collection('communities').doc(communityId)
      .collection('members').doc(userId).delete();

    // Update member count
    const newMemberCount = Math.max(0, (communityData?.memberCount || 0) - 1);
    
    await db.collection('communities').doc(communityId).update({
      memberCount: newMemberCount
    });

    res.json({ 
      message: 'Successfully removed member',
      memberCount: newMemberCount
    });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
}

// Transfer ownership (host only)
export async function transferOwnership(req: Request, res: Response) {
  try {
    const { communityId } = req.params;
    const { currentHostId, newHostId } = req.body;

    // Check if community exists
    const communityDoc = await db.collection('communities').doc(communityId).get();
    if (!communityDoc.exists) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const communityData = communityDoc.data();
    
    // Check if user is current host
    if (communityData?.hostId !== currentHostId) {
      return res.status(403).json({ error: 'Only current host can transfer ownership' });
    }

    // Check if new host is a member
    const newHostMemberDoc = await db.collection('communities').doc(communityId)
      .collection('members').doc(newHostId).get();
    
    if (!newHostMemberDoc.exists) {
      return res.status(400).json({ error: 'New host must be a member of the community' });
    }

    // Update community host
    await db.collection('communities').doc(communityId).update({
      hostId: newHostId
    });

    // Update member roles
    await db.collection('communities').doc(communityId)
      .collection('members').doc(currentHostId).update({
        role: 'member'
      });

    await db.collection('communities').doc(communityId)
      .collection('members').doc(newHostId).update({
        role: 'host'
      });

    res.json({ 
      message: 'Successfully transferred ownership',
      newHostId
    });
  } catch (error) {
    console.error('Error transferring ownership:', error);
    res.status(500).json({ error: 'Failed to transfer ownership' });
  }
}

// Import functions from searchController
async function deleteCommunityFromIndex(communityId: string) {
  try {
    const { meiliCommunityIndex } = await import("../services/meilisearch");
    await meiliCommunityIndex.deleteDocument(communityId);
  } catch (error) {
    console.error('Error deleting community from index:', error);
  }
}

async function deletePostFromIndex(postId: string) {
  try {
    const { meiliIndex } = await import("../services/meilisearch");
    await meiliIndex.deleteDocument(postId);
  } catch (error) {
    console.error('Error deleting post from index:', error);
  }
}
