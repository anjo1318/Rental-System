import BookPhoto from "../models/BookPhoto.js";

// ── POST /api/book-photos/pickup-photo/:id ────────────────────────────────
export const savePickupPhoto = async (req, res) => {
  try {
    const { id: bookId } = req.params;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded." });
    }

    const photoUrl = req.file.path; // Cloudinary URL

    // ✅ Upsert — create if not exists, update if exists
    const [bookPhoto, created] = await BookPhoto.findOrCreate({
      where: { bookId },
      defaults: { bookId, pickupPhoto: photoUrl },
    });

    if (!created) {
      await bookPhoto.update({ pickupPhoto: photoUrl });
    }

    return res.status(200).json({
      success: true,
      message: "Pickup photo saved.",
      data: {
        bookId,
        pickupPhoto: bookPhoto.pickupPhoto,
      },
    });
  } catch (error) {
    console.error("❌ savePickupPhoto error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/book-photos/return-photo/:id ────────────────────────────────
export const saveReturnPhoto = async (req, res) => {
  try {
    const { id: bookId } = req.params;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded." });
    }

    const photoUrl = req.file.path; // Cloudinary URL

    // ✅ Upsert — create if not exists, update if exists
    const [bookPhoto, created] = await BookPhoto.findOrCreate({
      where: { bookId },
      defaults: { bookId, returnPhoto: photoUrl },
    });

    if (!created) {
      await bookPhoto.update({ returnPhoto: photoUrl });
    }

    return res.status(200).json({
      success: true,
      message: "Return photo saved.",
      data: {
        bookId,
        returnPhoto: bookPhoto.returnPhoto,
      },
    });
  } catch (error) {
    console.error("❌ saveReturnPhoto error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/book-photos/:id ──────────────────────────────────────────────
export const getBookPhotos = async (req, res) => {
  try {
    const { id: bookId } = req.params;

    const bookPhoto = await BookPhoto.findOne({ where: { bookId } });

    if (!bookPhoto) {
      return res
        .status(404)
        .json({ success: false, message: "No photos found for this booking." });
    }

    return res.status(200).json({ success: true, data: bookPhoto });
  } catch (error) {
    console.error("❌ getBookPhotos error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
