import { Request, Response } from "express";
import { Community } from "../models/Community";
import { CommunityMember } from "../models/CommunityMember";
import { Post } from "../models/Post";
import { indexCommunity, deleteCommunity as deleteCommunityFromIndex } from "./searchController";
import { deletePost as deletePostFromIndex } from "./searchController";

// Get all communities from MongoDB
export async function getAllCommunities(req: Request, res: Response) {
  try {
    const communities = await Community.find({}).sort({ createdAt: -1 });
    
    const communitiesData = communities.map(community => ({
      objectID: community.id,
      displayName: community.displayName,
      slug: community.slug,
      description: community.description,
      iconUrl: community.iconUrl,
      createdAt: community.createdAt,
      memberCount: community.memberCount || 0,
      hostId: community.hostId
    }));

    res.json(communitiesData);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
}

// Get a single community by ID
export async function getCommunityById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const community = await Community.findById(id);
    
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const communityData = {
      objectID: community.id,
      displayName: community.displayName,
      slug: community.slug,
      description: community.description,
      iconUrl: community.iconUrl,
      createdAt: community.createdAt,
      memberCount: community.memberCount || 0,
      hostId: community.hostId
    };

    res.json(communityData);
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ error: 'Failed to fetch community' });
  }
}

// Create a new community
export async function createCommunity(req: Request, res: Response) {
  try {
    const { displayName, slug, description, iconUrl, hostId } = req.body;
    
    // Check if slug already exists
    const existingCommunity = await Community.findOne({ slug });
    if (existingCommunity) {
      return res.status(400).json({ error: 'Community with this slug already exists' });
    }
    
    const communityData = {
      displayName,
      slug,
      description,
      iconUrl,
      hostId,
      memberCount: 1 // Host is the first member
    };

    const newCommunity = await Community.create(communityData);
    
    // Add host as first member
    await CommunityMember.create({
      communityId: newCommunity._id,
      userId: hostId,
      role: 'host'
    });
    
    const communityResponse = {
      objectID: newCommunity.id,
      displayName: newCommunity.displayName,
      slug: newCommunity.slug,
      description: newCommunity.description,
      iconUrl: newCommunity.iconUrl,
      createdAt: newCommunity.createdAt,
      memberCount: newCommunity.memberCount,
      hostId: newCommunity.hostId
    };

    // Index in Meilisearch
    await indexCommunity(communityResponse);

    res.status(201).json(communityResponse);
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

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (displayName) community.displayName = displayName;
    if (description !== undefined) community.description = description;
    if (iconUrl !== undefined) community.iconUrl = iconUrl;
    
    await community.save();
    
    const updatedCommunity = {
      objectID: community.id,
      displayName: community.displayName,
      slug: community.slug,
      description: community.description,
      iconUrl: community.iconUrl,
      createdAt: community.createdAt,
      memberCount: community.memberCount || 0,
      hostId: community.hostId
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
    
    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }
    
    const communitySlug = community.slug;
    
    // Delete all posts in this community
    const posts = await Post.find({ communitySlug });
    
    for (const post of posts) {
      // Delete post from Meilisearch
      await deletePostFromIndex(post.id);
    }
    
    // Delete all posts from MongoDB
    await Post.deleteMany({ communitySlug });
    console.log(`Deleted ${posts.length} posts from community: ${communitySlug}`);
    
    // Delete all members
    await CommunityMember.deleteMany({ communityId: id });
    
    // Delete the community
    await Community.findByIdAndDelete(id);
    
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
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if user is already a member
    const existingMember = await CommunityMember.findOne({
      communityId,
      userId
    });
    
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add user as member
    await CommunityMember.create({
      communityId,
      userId,
      role: 'member'
    });

    // Update member count
    community.memberCount = (community.memberCount || 0) + 1;
    await community.save();

    res.json({ 
      message: 'Successfully joined community',
      memberCount: community.memberCount
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
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if user is a member
    const member = await CommunityMember.findOne({
      communityId,
      userId
    });
    
    if (!member) {
      return res.status(400).json({ error: 'User is not a member' });
    }

    // Host cannot leave (must transfer ownership or delete community)
    if (member.role === 'host') {
      return res.status(400).json({ error: 'Host cannot leave community. Transfer ownership or delete community.' });
    }

    // Remove user from members
    await CommunityMember.deleteOne({
      communityId,
      userId
    });

    // Update member count
    community.memberCount = Math.max(0, (community.memberCount || 0) - 1);
    await community.save();

    res.json({ 
      message: 'Successfully left community',
      memberCount: community.memberCount
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
    
    const members = await CommunityMember.find({ communityId });
    
    const membersData = members.map(member => ({
      userId: member.userId,
      role: member.role || 'member',
      joinedAt: member.joinedAt
    }));

    res.json(membersData);
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
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }
    
    // Check if user is host
    if (community.hostId !== hostId) {
      return res.status(403).json({ error: 'Only host can remove members' });
    }

    // Check if user to be removed is host
    if (userId === hostId) {
      return res.status(400).json({ error: 'Host cannot remove themselves' });
    }

    // Check if user is a member
    const member = await CommunityMember.findOne({
      communityId,
      userId
    });
    
    if (!member) {
      return res.status(400).json({ error: 'User is not a member' });
    }

    // Remove user from members
    await CommunityMember.deleteOne({
      communityId,
      userId
    });

    // Update member count
    community.memberCount = Math.max(0, (community.memberCount || 0) - 1);
    await community.save();

    res.json({ 
      message: 'Successfully removed member',
      memberCount: community.memberCount
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
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }
    
    // Check if user is current host
    if (community.hostId !== currentHostId) {
      return res.status(403).json({ error: 'Only current host can transfer ownership' });
    }

    // Check if new host is a member
    const newHostMember = await CommunityMember.findOne({
      communityId,
      userId: newHostId
    });
    
    if (!newHostMember) {
      return res.status(400).json({ error: 'New host must be a member of the community' });
    }

    // Update community host
    community.hostId = newHostId;
    await community.save();

    // Update member roles
    await CommunityMember.updateOne(
      { communityId, userId: currentHostId },
      { role: 'member' }
    );

    await CommunityMember.updateOne(
      { communityId, userId: newHostId },
      { role: 'host' }
    );

    res.json({ 
      message: 'Successfully transferred ownership',
      newHostId
    });
  } catch (error) {
    console.error('Error transferring ownership:', error);
    res.status(500).json({ error: 'Failed to transfer ownership' });
  }
}
