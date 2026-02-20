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

// ✅ Match the same upload path used in upload.js (persistent disk or fallback)
const baseUploadPath = process.env.UPLOAD_PATH || '/persistent_uploads';
const uploadDir = path.join(baseUploadPath, 'images');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Created upload directory: ${uploadDir}`);
} else {
  console.log(`📁 Using existing upload directory: ${uploadDir}`);
}

// ✅ Multer storage - filename pattern matches upload.js style
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `item-${uniqueSuffix}${ext}`); // ✅ consistent "item-" prefix
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg, .jpeg, .gif, and .webp formats are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// ─────────────────────────────────────────────
//                   ROUTES
// ─────────────────────────────────────────────

// ✅ Get customer progress by ID
router.get("/sign-up/progress/:id", getCustomerProgress);

// ✅ Upload guarantor ID photo + selfie only (no DB write)
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
          photoId: files?.photoId
            ? {
                filename: files.photoId[0].filename,
                url: `${baseUrl}/uploads/images/${files.photoId[0].filename}`, // ✅ full URL
              }
            : null,
          selfie: files?.selfie
            ? {
                filename: files.selfie[0].filename,
                url: `${baseUrl}/uploads/images/${files.selfie[0].filename}`, // ✅ full URL
              }
            : null,
        },
      });
    } catch (error) {
      console.error("File upload error:", error);
      return res.status(500).json({
        success: false,
        message: "File upload failed",
      });
    }
  }
);

// ✅ Full customer signup with optional ID photo + selfie
router.post(
  "/sign-up",
  upload.fields([
    { name: "photoId", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  customerSignUp  // ← controller handles DB write + URL construction
);

// ✅ Fetch all customers
router.get("/", fetchCustomers);

// ✅ Update customer details by ID
router.put("/update/:id", updateCustomerDetails);

// ✅ Upload/replace customer profile photo by ID
router.post(
  "/upload-photo/:id",
  upload.single("photo"),
  uploadCustomerPhoto  // ← controller stores filename + returns URL
);

// ─────────────────────────────────────────────
//              MULTER ERROR HANDLER
// ─────────────────────────────────────────────
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files uploaded.",
      });
    }
  }

  if (error.message?.includes("formats are allowed")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
});

export default router;