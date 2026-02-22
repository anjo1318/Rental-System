import express from "express";
import {
  notifyOwner,
  savePushToken,
} from "../controllers/notificationsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/push-token", authMiddleware, savePushToken);
router.post("/notify-owner/admin", notifyOwner);

export default router;
