import express from "express";
import { body, param } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  fetchCustomers,
  updateCustomerDetails,
  customerSignUp,
  getCustomerProgress // We need to add this to the controller
} from "../controllers/customerController.js";

const router = express.Router();

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// ✅ ADD THE MISSING ROUTE that your frontend is calling
router.get("/sign-up/progress/:id", getCustomerProgress);

// File upload route for guarantors and ID
router.post(
  "/sign-up/guarantors-id", 
  upload.fields([
    { name: "photoId", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const files = req.files;
      const response = {
        success: true,
        message: "Files uploaded successfully",
        files: {
          photoId: files.photoId ? files.photoId[0].filename : null,
          selfie: files.selfie ? files.selfie[0].filename : null
        }
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({
        success: false,
        message: "File upload failed"
      });
    }
  }
);

// Final signup route
router.post("/sign-up", customerSignUp);

// Get all customers
router.get("/", fetchCustomers);

// Update customer details
router.put("/update/:id", updateCustomerDetails);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed!'
    });
  }
  
  next(error);
});

export default router;