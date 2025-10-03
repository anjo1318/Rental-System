import express from "express";
import multer from "multer";
import path from "path";

import { 
  authenticateToken, 
  fetchOwnerItems, 
  fetchOwners, 
  getOwnerItems,
  createOwnerItem,
  updateOwnerItem,
  deleteOwnerItem,
  updateOwnerProfile
} from "../controllers/ownerController.js";

const router = express.Router();

// 🔹 Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // save uploads in /uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

// 🔹 File filter (accept images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

// ---------------- Routes ----------------

// Public routes
router.get("/all", fetchOwners); // Get all owners
router.get("/items/:ownerId", fetchOwnerItems);

// Protected routes
router.get("/owner/items", authenticateToken, getOwnerItems); // Get authenticated owner's items
router.post("/items", authenticateToken, createOwnerItem); // Create new item
router.put("/items/:id", authenticateToken, updateOwnerItem); // Update item
router.delete("/items/:id", authenticateToken, deleteOwnerItem); // Delete item

// 🔹 Update owner profile (with optional image upload for gcashQR and profileImage)
router.put(
  "/update/:id", 
  upload.fields([
    { name: "gcashQR", maxCount: 1 },
    { name: "profileImage", maxCount: 1 }
  ]), 
  updateOwnerProfile
);

export default router;
