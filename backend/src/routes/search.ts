import { Router } from "express";
import { searchAll, migrateCommunities } from "../controllers/searchController";

const router = Router();
router.get("/", searchAll);
router.post("/migrate-communities", migrateCommunities);
export default router;
