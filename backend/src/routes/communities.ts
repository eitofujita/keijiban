import { Router } from "express";
import { 
  getAllCommunities, 
  getCommunityById, 
  createCommunity, 
  updateCommunity, 
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  removeMember,
  transferOwnership
} from "../controllers/communityController";

const router = Router();

// Get all communities
router.get("/", getAllCommunities);

// Get community by ID
router.get("/:id", getCommunityById);

// Create new community
router.post("/", createCommunity);

// Update community
router.patch("/:id", updateCommunity);

// Delete community
router.delete("/:id", deleteCommunity);

// Member management
router.post("/:communityId/join", joinCommunity);
router.post("/:communityId/leave", leaveCommunity);
router.get("/:communityId/members", getCommunityMembers);
router.delete("/:communityId/members/:userId", removeMember);
router.post("/:communityId/transfer-ownership", transferOwnership);

export default router;
