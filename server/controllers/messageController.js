import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import { Op } from 'sequelize';

export const sendMessage = async (req, res) => {
  try {
    const { chatId, senderId, content } = req.body;
    const userId = req.user?.id; // From authenticateToken middleware
    
    if (!chatId || !senderId || !content) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields: chatId, senderId, content" 
      });
    }

    // Verify chat exists and user has access
    const chat = await Chat.findOne({
      where: {
        id: chatId,
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

    // Verify senderId matches authenticated user
    if (senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Cannot send message as another user"
      });
    }

    const message = await Message.create({
      chatId,
      senderId,
      content,
    });

    // Update chat's lastMessageAt
    await chat.update({ updatedAt: new Date() });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error("❌ Error in sendMessage:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to send message",
      error: error.message 
    });
  }
};

export const getMessagesByChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.id; // From authenticateToken middleware

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Chat ID is required"
      });
    }

    // Verify user has access to this chat
    const chat = await Chat.findOne({
      where: {
        id: chatId,
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

    const messages = await Message.findAll({
      where: { chatId },
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Error in getMessagesByChat:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to load messages",
      error: error.message 
    });
  }
};