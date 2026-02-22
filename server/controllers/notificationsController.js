import UserPushToken from "../models/UserPushToken.js";
import Book from "../models/Book.js";
import Owner from "../models/Owner.js";
import { sendMail } from "../utils/mailer.js";
import { paymentPendingTemplate } from "../utils/emailTemplates.js";

const pushToken = async (req, res) => {
  try {
    const { token, platform } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    await UserPushToken.findOrCreate({
      where: { token },
      defaults: {
        userId: req.user.id,
        platform,
      },
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
      defaults: {
        userId: req.user.id,
        platform,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Push token error:", error);
    res.status(500).json({ message: "Failed to save push token" });
  }
};

export const notifyOwner = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res
        .status(400)
        .json({ success: false, message: "bookingId is required." });
    }

    const booking = await Book.findOne({ where: { id: bookingId } });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });
    }

    const owner = await Owner.findOne({
      where: { id: booking.ownerId },
      attributes: ["id", "firstName", "middleName", "lastName", "email"],
    });

    if (!owner) {
      return res
        .status(404)
        .json({ success: false, message: "Owner not found." });
    }

    const ownerName = [owner.firstName, owner.middleName, owner.lastName]
      .filter(Boolean)
      .join(" ");

    // ✅ Respond immediately so the frontend doesn't wait
    res.status(200).json({
      success: true,
      message: `Notification sent to ${ownerName} at ${owner.email}`,
    });

    // ✅ Continue sending email in the background AFTER response is sent
    const html = paymentPendingTemplate({
      ownerName,
      renterName: booking.name,
      product: booking.product,
      productImage: booking.productImage ?? null,
      rentalPrice: booking.grandTotal ?? 0,
      totalAmount: booking.grandTotal ?? 0,
      bookingDate: booking.created_at,
      bookingId: booking.id,
      deadlineHours: 24,
    });

    await sendMail({
      to: owner.email,
      subject: "⚠️ Payment Pending — Action Required Within 24 Hours",
      html,
    });

    console.log(`✅ Email sent to ${owner.email}`);
  } catch (error) {
    console.error("❌ notifyOwner error:", error);

    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export { savePushToken, pushToken };
