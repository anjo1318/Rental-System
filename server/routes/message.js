import express from "express";
import { sendMessage, getMessagesByChat } from '../controllers/messageController.js';
import { authenticateToken } from '../controllers/ownerController.js';

const router = express.Router();

router.post("/", authenticateToken, sendMessage);
router.get("/:chatId", authenticateToken, getMessagesByChat);

export default router;