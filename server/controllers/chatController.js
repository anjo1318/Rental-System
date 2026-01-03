import Chat from "../models/Chat.js";
import { Op } from 'sequelize';
import Customer from '../models/Customer.js';
import Owner from '../models/Owner.js';
import Message from '../models/Message.js';

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

export const getUserChats = async (req, res) => {
  try {
    console.log("📥 getUserChats - Request received");
    const userId = req.user?.id;
    const userType = req.user?.type; // 'customer' or 'owner'
    
    console.log("👤 User ID:", userId);
    console.log("👤 User Type:", userType);
    
    if (!userId) {
      console.error("❌ No user ID found");
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    console.log("🔍 Fetching chats for user:", userId);
    
    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { customerId: userId },
          { ownerId: userId }
        ]
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'firstName', 'middleName', 'lastName', 'emailAddress']
        },
        {
          model: Owner,
          as: 'owner',
          attributes: ['id', 'firstName', 'middleName', 'lastName', 'email']
        }
      ],
      order: [["updatedAt", "DESC"]],
    });

    console.log("💬 Found", chats.length, "chats");

    // For each chat, get the last message
    const chatsWithDetails = await Promise.all(
      chats.map(async (chat) => {
        console.log("🔍 Processing chat ID:", chat.id);
        
        // Get the last message for this chat
        const lastMessage = await Message.findOne({
          where: { chatId: chat.id },
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'content', 'createdAt', 'senderId']
        });

        console.log("💬 Last message for chat", chat.id, ":", lastMessage?.content || "No messages");

        // Determine the other user (not the current user)
        let otherUser = null;
        let otherUserName = '';
        
        if (chat.customerId === userId) {
          // Current user is customer, show owner's info
          otherUser = chat.owner;
          if (otherUser) {
            otherUserName = `${otherUser.firstName} ${otherUser.middleName ? otherUser.middleName + ' ' : ''}${otherUser.lastName}`.trim();
          }
        } else {
          // Current user is owner, show customer's info
          otherUser = chat.customer;
          if (otherUser) {
            otherUserName = `${otherUser.firstName} ${otherUser.middleName ? otherUser.middleName + ' ' : ''}${otherUser.lastName}`.trim();
          }
        }

        console.log("👤 Other user name:", otherUserName);

        return {
          id: chat.id,
          itemId: chat.itemId,
          customerId: chat.customerId,
          ownerId: chat.ownerId,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          otherUserName: otherUserName || 'Unknown User',
          otherUserId: otherUser?.id || null,
          lastMessage: lastMessage ? {
            text: lastMessage.content,
            createdAt: lastMessage.createdAt,
            senderId: lastMessage.senderId,
            isFromMe: lastMessage.senderId === userId
          } : null
        };
      })
    );

    console.log("✅ Returning", chatsWithDetails.length, "chats with details");

    res.status(200).json({
      success: true,
      data: chatsWithDetails
    });
  } catch (error) {
    console.error("❌ Error in getUserChats:", error);
    console.error("❌ Error stack:", error.stack);
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