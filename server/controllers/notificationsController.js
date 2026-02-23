import UserPushToken from "../models/UserPushToken.js";
import Book from "../models/Book.js"; // ✅ Fixed: Books.js not Book.js
import Owner from "../models/Owner.js";
import EmailNotificationLog from "../models/EmailNotificationLog.js";
import { sendMail } from "../utils/mailer.js";
import { paymentPendingTemplate } from "../utils/emailTemplates.js";
import { Op } from "sequelize";

const pushToken = async (req, res) => {
  try {
    const { token, platform } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }
    await UserPushToken.findOrCreate({
      where: { token },
      defaults: { userId: req.user.id, platform },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to save token" });
  }
};

const savePushToken = async (req, res) => {
  try {
    const { token, platform } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Push token required" });
    }
    await UserPushToken.findOrCreate({
      where: { token },
      defaults: { userId: req.user.id, platform },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Push token error:", error);
    res.status(500).json({ message: "Failed to save push token" });
  }
};

const notifyOwner = async (req, res) => {
  const { bookingId } = req.body;
  let booking = null;
  let owner = null;

  try {
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "bookingId is required." });
    }

    booking = await Book.findOne({ where: { id: bookingId } });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    owner = await Owner.findOne({
      where: { id: booking.ownerId },
      attributes: ["id", "firstName", "middleName", "lastName", "email"],
    });
    if (!owner) {
      return res.status(404).json({ success: false, message: "Owner not found." });
    }

    const ownerName = [owner.firstName, owner.middleName, owner.lastName]
      .filter(Boolean)
      .join(" ");

    // ✅ Save to database (no email sending)
    await EmailNotificationLog.create({
      bookingId: booking.id,
      ownerId: owner.id,
      ownerName,
      ownerEmail: owner.email,
      renterName: booking.name,
      product: booking.product,
      productImage: booking.itemImage ?? null,
      rentalPrice: booking.grandTotal ?? 0,
      totalAmount: booking.grandTotal ?? 0,
      bookingDate: booking.created_at,
      deadlineHours: 24,
      subject: "⚠️ Payment Pending — Action Required Within 24 Hours",
      status: "sent",
      sentAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: `Notification logged for ${ownerName}`,
    });

  } catch (error) {
    console.error("❌ notifyOwner error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getNotifications = async (req, res) => {
  console.log("📥 getNotifications hit, ownerId:", req.params.ownerId);
  try {
    const ownerId = parseInt(req.params.ownerId);
    console.log("📥 Parsed ownerId:", ownerId);

    const notifications = await Book.findAll({
      where: {
        ownerId,
        status: { [Op.in]: ["ongoing", "approved"] },
      },
      order: [["created_at", "DESC"]],
      attributes: [
        "id",
        "product",
        "category",
        "status",
        "itemImage",
        "pickUpDate",
        "returnDate",
        "pricePerDay",
        "rentalPeriod",
        "paymentMethod",
        "name",
        "email",
        "phone",
        "address",
        "gender",
        "isRead",
        "readAt",
        "created_at",
      ],
    });

    // ✅ Fetch matching email logs for this owner
    const emailLogs = await EmailNotificationLog.findAll({
      where: { ownerId },
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "bookingId",
        "ownerName",
        "ownerEmail",
        "renterName",
        "product",
        "productImage",
        "rentalPrice",
        "totalAmount",
        "bookingDate",
        "subject",
        "status",
        "sentAt",
        "errorMessage",
        "createdAt",
      ],
    });

    console.log("✅ Found notifications:", notifications.length);
    console.log("✅ Found email logs:", emailLogs.length);

    res.status(200).json({
      success: true,
      data: notifications,
      emailLogs, // ✅ included in response
    });
  } catch (error) {
    console.error("❌ getNotifications CRASH:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { bookingId, ownerId } = req.body;

    if (!bookingId || !ownerId) {
      return res.status(400).json({
        success: false,
        message: "bookingId and ownerId are required",
      });
    }

    const booking = await Book.findOne({
      where: { id: bookingId, ownerId: parseInt(ownerId) },
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    await booking.update({ isRead: true, readAt: new Date() });

    res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    console.error("❌ markAsRead error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { savePushToken, markAsRead, getNotifications, notifyOwner, pushToken };
