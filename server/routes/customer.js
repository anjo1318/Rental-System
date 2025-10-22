import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  fetchCustomers,
  updateCustomerDetails,
  customerSignUp,
  getCustomerProgress
} from "../controllers/customerController.js";

const router = express.Router();

// Upload directory
const uploadDir = path.join(process.cwd(), "server", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// ✅ Get signup progress
router.get("/sign-up/progress/:id", getCustomerProgress);

// ✅ File upload (guarantors + ID)
router.post(
  "/sign-up/guarantors-id",
  upload.fields([
    { name: "photoId", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const files = req.files;
      res.status(200).json({
        success: true,
        message: "Files uploaded successfully",
        files: {
          photoId: files?.photoId ? files.photoId[0].filename : null,
          selfie: files?.selfie ? files.selfie[0].filename : null,
        },
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({
        success: false,
        message: "File upload failed",
      });
    }
  }
);

// ✅ Final signup (with file upload support)
router.post(
  "/sign-up",
  upload.fields([
    { name: "photoId", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  customerSignUp
);

// ✅ Get all customers
router.get("/", fetchCustomers);

// ✅ Update customer details
router.put("/update/:id", updateCustomerDetails);

// Multer error handling
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
  }

  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({
      success: false,
      message: "Only image files are allowed!",
    });
  }

  next(error);
});

export default router;
