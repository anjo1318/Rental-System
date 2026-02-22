import express from "express";
import {
  notifyOwner,
  savePushToken,
  getNotifications,
  markAsRead,
} from "../controllers/notificationsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/push-token", authMiddleware, savePushToken);
router.post("/notify-owner/admin", notifyOwner);
router.get("/owner-notifications/:ownerId", getNotifications); // ✅ public, ownerId in URL
router.patch("/mark-as-read", markAsRead); // ✅ no middleware

export default router;
