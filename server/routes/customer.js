import express from "express";
import { body, param } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  signupPersonalInfo,
  signupAddress,
  signupGuarantorsAndId,
  finalizeSignup,
  getSignupProgress,
  fetchCustomers
} from "../controllers/customerController.js";

const router = express.Router();

console.log("Customer router is being loaded...");

// ✅ SETUP MULTER STORAGE (move from server.js to here)
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

// Validation middleware
const validatePersonalInfo = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('emailAddress').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phoneNumber').isMobilePhone('any').withMessage('Valid phone number is required'),
  body('birthday').isISO8601().withMessage('Valid birthday is required'),
  body('gender').toLowerCase().isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const validateAddress = [
  body('customerId').isNumeric().withMessage('Valid customer ID is required'),
  body('houseNumber').trim().notEmpty().withMessage('House number is required'),
  body('street').trim().notEmpty().withMessage('Street is required'),
  body('barangay').trim().notEmpty().withMessage('Barangay is required'),
  body('town').trim().notEmpty().withMessage('Town is required'),
  body('province').trim().notEmpty().withMessage('Province is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('zipCode').trim().notEmpty().withMessage('Zip code is required'),
];

// ✅ UPDATED VALIDATION - No longer validate URLs since we handle file uploads
const validateGuarantors = [
  body('customerId').isNumeric().withMessage('Valid customer ID is required'),
  body('guarantor1FullName').trim().notEmpty().withMessage('Guarantor 1 full name is required'),
  body('guarantor1Address').trim().notEmpty().withMessage('Guarantor 1 address is required'),
  body('guarantor1MobileNumber').isMobilePhone().withMessage('Guarantor 1 valid mobile number is required'),
  body('guarantor2FullName').trim().notEmpty().withMessage('Guarantor 2 full name is required'),
  body('guarantor2Address').trim().notEmpty().withMessage('Guarantor 2 address is required'),
  body('guarantor2MobileNumber').isMobilePhone().withMessage('Guarantor 2 valid mobile number is required'),
  body('idType').trim().notEmpty().withMessage('ID type is required'),
  body('idNumber').trim().notEmpty().withMessage('ID number is required'),
  // Files will be validated by multer
];

const validateFinalize = [
  body('customerId').isNumeric().withMessage('Valid customer ID is required'),
];

const validateProgress = [
  param('customerId').isNumeric().withMessage('Valid customer ID is required'),
];

// ✅ ROUTES WITH PROPER FILE UPLOAD HANDLING

// Step 1 - Personal Info
router.post("/sign-up/personal-info", validatePersonalInfo, signupPersonalInfo);

// Step 2 - Address
router.post("/sign-up/address", validateAddress, signupAddress);

// ✅ Step 3 - UPDATED: Use multer for file uploads + validation
router.post(
  "/sign-up/guarantors-id", 
  upload.fields([
    { name: "photoId", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  validateGuarantors, 
  signupGuarantorsAndId
);

// Step 4 - Finalize
router.post("/sign-up/finalize", validateFinalize, finalizeSignup);

// Get signup progress
router.get("/sign-up/progress/:customerId", validateProgress, getSignupProgress);

// Get all customers
router.get("/", fetchCustomers);

// ✅ ERROR HANDLING MIDDLEWARE for multer
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