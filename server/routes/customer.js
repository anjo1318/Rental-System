import express from "express";
import { body, param } from 'express-validator';
import {
  signupPersonalInfo,
  signupAddress,
  signupGuarantorsAndId,
  finalizeSignup,
  getSignupProgress
} from "../controllers/customerController.js";

const router = express.Router();

console.log("Customer router is being loaded...");

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
];

const validateFinalize = [
  body('customerId').isNumeric().withMessage('Valid customer ID is required'),
];

const validateProgress = [
  param('customerId').isNumeric().withMessage('Valid customer ID is required'),
];

// Routes with validation
router.post("/sign-up/personal-info", validatePersonalInfo, signupPersonalInfo);

router.post("/sign-up/address", validateAddress, signupAddress);

router.post("/sign-up/guarantors-id", validateGuarantors, signupGuarantorsAndId);

router.post("/sign-up/finalize", validateFinalize, finalizeSignup);

// Get signup progress
router.get("/sign-up/progress/:customerId", validateProgress, getSignupProgress);

export default router;