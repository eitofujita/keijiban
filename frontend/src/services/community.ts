const API_BASE_URL = 'http://localhost:3000';

export interface Community {
  objectID: string;
  displayName: string;
  slug: string;
  description: string;
  iconUrl?: string;
  createdAt: string;
  memberCount: number;
  hostId: string;
}

export interface CommunityMember {
  userId: string;
  role: 'host' | 'member';
  joinedAt: string;
}

// Get all communities
export const getAllCommunities = async (): Promise<Community[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/communities`);
    if (!response.ok) {
      throw new Error('Failed to fetch communities');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching communities:', error);
    throw error;
  }
};

// Get community by ID
export const getCommunityById = async (id: string): Promise<Community> => {
  try {
    const response = await fetch(`${API_BASE_URL}/communities/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch community');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching community:', error);
    throw error;
  }
};

// Create new community
export const createCommunity = async (communityData: {
  displayName: string;
  slug: string;
  description: string;
  iconUrl?: string;
  hostId: string;
}): Promise<Community> => {
  try {
    const response = await fetch(`${API_BASE_URL}/communities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(communityData),
    });
    if (!response.ok) {
      throw new Error('Failed to create community');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating community:', error);
    throw error;
  }
};

// Join community
export const joinCommunity = async (communityId: string, userId: string): Promise<{ message: string; memberCount: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      throw new Error('Failed to join community');
    }
    return await response.json();
  } catch (error) {
    console.error('Error joining community:', error);
    throw error;
  }
};

// Leave community
export const leaveCommunity = async (communityId: string, userId: string): Promise<{ message: string; memberCount: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      throw new Error('Failed to leave community');
    }
    return await response.json();
  } catch (error) {
    console.error('Error leaving community:', error);
    throw error;
  }
};

// Get community members
export const getCommunityMembers = async (communityId: string): Promise<CommunityMember[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/members`);
    if (!response.ok) {
      throw new Error('Failed to fetch community members');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching community members:', error);
    throw error;
  }
};

// Remove member (host only)
export const removeMember = async (communityId: string, userId: string, hostId: string): Promise<{ message: string; memberCount: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/members/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hostId }),
    });
    if (!response.ok) {
      throw new Error('Failed to remove member');
    }
    return await response.json();
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
};

// Transfer ownership (host only)
export const transferOwnership = async (communityId: string, currentHostId: string, newHostId: string): Promise<{ message: string; newHostId: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/transfer-ownership`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentHostId, newHostId }),
    });
    if (!response.ok) {
      throw new Error('Failed to transfer ownership');
    }
    return await response.json();
  } catch (error) {
    console.error('Error transferring ownership:', error);
    throw error;
  }
};
