import express from "express";
import { getMessages, postMessage } from "../controllers/chatController.js";

const router = express.Router();

// // Get all messages for a chat
// router.get("/:id", getMessages);

// // Send a message
// router.post("/", postMessage);

export default router;
