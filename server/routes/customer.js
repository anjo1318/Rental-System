import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  fetchCustomers,
  updateCustomerDetails,
  customerSignUp,
  getCustomerProgress,
  uploadCustomerPhoto
} from "../controllers/customerController.js";

const router = express.Router();

// ✅ Use the SAME env variable — no mkdir here, index.js already handles it
const baseUploadPath = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');
const uploadDir = path.join(baseUploadPath, 'images');

// ✅ No fs.mkdirSync here — directory is created once in index.js

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `item-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  allowedTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Only .png, .jpg, .jpeg, .gif, and .webp formats are allowed!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

// ─────────────────────────────────────────────
//                   ROUTES
// ─────────────────────────────────────────────

router.get("/sign-up/progress/:id", getCustomerProgress);

router.post(
  "/sign-up/guarantors-id",
  upload.fields([
    { name: "photoId", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const files = req.files;

      if (!files?.photoId && !files?.selfie) {
        return res.status(400).json({
          success: false,
          message: "No files were uploaded",
        });
      }

      const baseUrl = `${req.protocol}://${req.get("host")}`;

      return res.status(200).json({
        success: true,
        message: "Files uploaded successfully",
        files: {
          photoId: files?.photoId ? {
            filename: files.photoId[0].filename,
            url: `${baseUrl}/uploads/images/${files.photoId[0].filename}`,
          } : null,
          selfie: files?.selfie ? {
            filename: files.selfie[0].filename,
            url: `${baseUrl}/uploads/images/${files.selfie[0].filename}`,
          } : null,
        },
      });
    } catch (error) {
      console.error("File upload error:", error);
      return res.status(500).json({ success: false, message: "File upload failed" });
    }
  }
);

router.post(
  "/sign-up",
  upload.fields([
    { name: "photoId", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  customerSignUp
);

router.get("/", fetchCustomers);

router.put("/update/:id", updateCustomerDetails);

router.post("/upload-photo/:id", upload.single("photo"), uploadCustomerPhoto);

// ─────────────────────────────────────────────
//              MULTER ERROR HANDLER
// ─────────────────────────────────────────────
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "File too large. Maximum size is 5MB." });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ success: false, message: "Too many files uploaded." });
    }
  }
  if (error.message?.includes("formats are allowed")) {
    return res.status(400).json({ success: false, message: error.message });
  }
  next(error);
});

export default router;