import express from "express";
import { getOrCreateChat, checkChatExists, getUserChats, getChatById } from '../controllers/chatController.js';
import {authenticateToken} from '../controllers/ownerController.js';

const router = express.Router();

// Create or get existing chat
router.post("/get-or-create", authenticateToken, getOrCreateChat);

// Check if chat exists for an item (IMPORTANT: This route must come before /:id routes)
router.get("/check/:itemId", authenticateToken, checkChatExists);

// Get all chats for current user
router.get("/user-chats", authenticateToken, getUserChats);

// Get specific chat by ID - ADD THIS
router.get("/:id", authenticateToken, getChatById);

export default router;