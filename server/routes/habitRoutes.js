// /home/elcskater/TNS/company_site/server/routes/habitRoutes.js
import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";

import {
  getHabitSettings,
  saveHabitSettings,
  getHabitStats,
  logHabitUse,
  postHabitCheckIn,
  postHabitEvent,
} from "../controllers/habitController.js";

const router = express.Router();

router.get("/settings", requireAuth, getHabitSettings);
router.post("/settings", requireAuth, saveHabitSettings);

router.get("/stats", requireAuth, getHabitStats);

// legacy endpoint (kept)
router.post("/log", requireAuth, logHabitUse);

// correct endpoints used by the client
router.post("/checkin", requireAuth, postHabitCheckIn);
router.post("/events", requireAuth, postHabitEvent);

export default router;
