import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getRaffleStats, enterRaffle } from "../controllers/raffleController.js";

const router = express.Router();

// Stats can be public-ish, but if you want req.userId populated when logged in,
// you still need auth. Easiest: protect everything.
router.use(requireAuth);

router.get("/stats", getRaffleStats);
router.post("/enter", enterRaffle);

export default router;
