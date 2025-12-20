// server/routes/raffleRoutes.js
import express from "express";
import {
  getRaffleStats,
  enterRaffle,
} from "../controllers/raffleController.js";

const router = express.Router();

router.get("/stats", getRaffleStats);
router.post("/enter", enterRaffle);

export default router;
