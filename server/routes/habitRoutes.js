// /home/elcskater/TNS/company_site/server/routes/habitRoutes.js
import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";

import {
  getHabitSettings,
  saveHabitSettings,
  getHabitStats,
  logHabitUse,
  postHabitCheckIn
} from "../controllers/habitController.js";

const router = express.Router();

router.get("/settings", requireAuth, getHabitSettings);
router.post("/settings", requireAuth, saveHabitSettings);

router.get("/stats", requireAuth, getHabitStats);

// Your original endpoint
router.post("/log", requireAuth, logHabitUse);

// ✅ aliases so the client doesn't 404
router.post("/checkin", requireAuth, logHabitUse);
router.post("/events", requireAuth, logHabitUse);
router.post("/checkin", requireAuth, postHabitCheckIn);

export default router;
