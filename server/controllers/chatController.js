import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

// GET messages by chatId
export const getMessages = async (req, res) => {
  const { id: chatId } = req.params; // chatId passed in URL
  try {
    const messages = await Message.findAll({
      where: { chatId },
      order: [["createdAt", "ASC"]],
    });
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
};

// POST a new message
export const postMessage = async (req, res) => {
  const { chatId, sender, text } = req.body;

  if (!chatId || !sender || !text) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    const message = await Message.create({ chatId, sender, text });
    res.json({ success: true, data: message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
};

// chatController.js

export const checkChat = async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user.id; // if using authentication

  try {
    const chat = await Chat.findOne({ where: { itemId, customerId: userId } });
    if (chat) {
      return res.json({ success: true, chatId: chat.id });
    }
    res.json({ success: true, chatId: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to check chat" });
  }
};
