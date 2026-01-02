import Chat from "../models/Chat.js";
import { Op } from 'sequelize';

export const getOrCreateChat = async (req, res) => {
  try {
    const { itemId, customerId, ownerId } = req.body;
    
    if (!itemId || !customerId || !ownerId) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields: itemId, customerId, ownerId" 
      });
    }

    const [chat, created] = await Chat.findOrCreate({
      where: {
        itemId,
        customerId,
        ownerId,
      },
    });
    
    res.status(200).json({
      success: true,
      id: chat.id,
      itemId: chat.itemId,
      customerId: chat.customerId,
      ownerId: chat.ownerId,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      isNew: created
    });
  } catch (error) {
    console.error("❌ Error in getOrCreateChat:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to create chat",
      error: error.message 
    });
  }
};

// Check if chat exists for an item and current user
export const checkChatExists = async (req, res) => {
  try {
    const { itemId } = req.params;
    const customerId = req.user?.id; // From auth middleware

    console.log("🔍 Checking chat for itemId:", itemId, "customerId:", customerId);

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const chat = await Chat.findOne({
      where: {
        itemId: parseInt(itemId),
        customerId: customerId,
      },
    });

    console.log("💬 Chat found:", chat ? `ID: ${chat.id}` : "none");

    if (chat) {
      res.status(200).json({
        success: true,
        chatId: chat.id,
        exists: true
      });
    } else {
      res.status(200).json({
        success: true,
        exists: false,
        chatId: null
      });
    }
  } catch (error) {
    console.error("❌ Error in checkChatExists:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to check chat",
      error: error.message 
    });
  }
};

// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { customerId: userId },
          { ownerId: userId }
        ]
      },
      order: [["updatedAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error("❌ Error in getUserChats:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get chats",
      error: error.message 
    });
  }
};

// Add this function to your chatController.js
export const getChatById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const chat = await Chat.findOne({
      where: {
        id: parseInt(id),
        [Op.or]: [
          { customerId: userId },
          { ownerId: userId }
        ]
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found or access denied"
      });
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error("❌ Error in getChatById:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get chat",
      error: error.message 
    });
  }
};