// /home/elcskater/TNS/company_site/server/routes/habitsRoutes.js
import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  getSettings,
  saveSettings,
  postEvent,
  getStats,
} from "../controllers/habitsController.js";

// add near other imports
import { postEvent } from "../controllers/habitsController.js";

// event logging (use / resist)
router.post("/event", requireAuth, postEvent);

const router = express.Router();

// Settings
router.get("/settings", requireAuth, getSettings);
router.post("/settings", requireAuth, saveSettings);

// Event logging (core)
router.post("/event", requireAuth, postEvent);

// Backwards-compatible alias if you already wired "checkin"
router.post("/checkin", requireAuth, postEvent);

// Stats for dashboard
router.get("/stats", requireAuth, getStats);

export default router;
