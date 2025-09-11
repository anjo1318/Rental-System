import Customer from "../models/Customer.js";
import bcrypt from "bcryptjs";
import { validationResult } from 'express-validator';
import sequelize from "../database/database.js";

// Helper function to handle validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array()
    });
  }
  return null;
};

// STEP 1 - Personal Info (unchanged)
const signupPersonalInfo = async (req, res) => {
  console.log("🚀 Starting personal info signup");
  
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  const transaction = await sequelize.transaction();
  
  try {
    const { 
      firstName, 
      middleName, 
      lastName, 
      emailAddress, 
      phoneNumber, 
      birthday, 
      gender, 
      password 
    } = req.body;

    const existingUser = await Customer.findOne({ 
      where: { emailAddress },
      transaction
    });
    
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: "Email already registered" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newCustomer = await Customer.create({
      firstName,
      middleName,
      lastName,
      emailAddress,
      phoneNumber,
      birthday,
      gender,
      password: hashedPassword,
      signupStep: 1,
      isSignupComplete: false,
      role: 'pending'
    }, { transaction });

    await transaction.commit();

    console.log("✅ Personal info saved successfully for customer:", newCustomer.id);
    
    return res.status(201).json({ 
      success: true, 
      message: "Personal information saved successfully", 
      customerId: newCustomer.id,
      nextStep: 2
    });

  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error in signupPersonalInfo:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error. Please try again." 
    });
  }
};

// STEP 2 - Address (unchanged)
const signupAddress = async (req, res) => {
  console.log("🏠 Starting address signup");
  
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  const transaction = await sequelize.transaction();

  try {
    const { 
      customerId, 
      houseNumber, 
      street, 
      barangay, 
      town, 
      province, 
      country, 
      zipCode 
    } = req.body;

    const customer = await Customer.findByPk(customerId, { transaction });
    
    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false, 
        message: "Customer not found" 
      });
    }

    if (customer.signupStep < 1) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: "Please complete personal information first" 
      });
    }

    await customer.update({
      houseNumber,
      street,
      barangay,
      town,
      province,
      country,
      zipCode,
      signupStep: 2
    }, { transaction });

    await transaction.commit();

    console.log("✅ Address saved successfully for customer:", customerId);

    return res.status(200).json({ 
      success: true, 
      message: "Address information saved successfully", 
      customerId,
      nextStep: 3
    });

  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error in signupAddress:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error. Please try again." 
    });
  }
};

// ✅ STEP 3 - COMPLETELY REWRITTEN for file uploads
const signupGuarantorsAndId = async (req, res) => {
  console.log("👥 Starting guarantors and ID signup with file uploads");
  
  const transaction = await sequelize.transaction();

  try {
    const { 
      customerId, 
      guarantor1FullName, 
      guarantor1Address, 
      guarantor1MobileNumber, 
      guarantor2FullName, 
      guarantor2Address, 
      guarantor2MobileNumber, 
      idType, 
      idNumber
    } = req.body;

    // Get uploaded files
    const files = req.files;
    console.log("📁 Received files:", files);
    console.log("📋 Received body data:", req.body);

    // Find customer and verify they're on the correct step
    const customer = await Customer.findByPk(customerId, { transaction });
    
    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false, 
        message: "Customer not found" 
      });
    }

    if (customer.signupStep < 2) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: "Please complete address information first" 
      });
    }

    // ✅ CONSTRUCT FULL URLs for uploaded files
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const updateData = {
      guarantor1FullName,
      guarantor1Address,
      guarantor1MobileNumber,
      guarantor2FullName,
      guarantor2Address,
      guarantor2MobileNumber,
      idType,
      idNumber,
      signupStep: 3
    };

    // ✅ ADD FILE PATHS/URLS if files were uploaded
    if (files?.photoId?.[0]) {
      updateData.idPhoto = files.photoId[0].path; // Store file path
      updateData.idPhotoUrl = `${baseUrl}/${files.photoId[0].path}`; // Store full URL
      console.log("📸 ID Photo saved:", updateData.idPhotoUrl);
    }

    if (files?.selfie?.[0]) {
      updateData.selfieUrl = `${baseUrl}/${files.selfie[0].path}`; // Store full URL  
      console.log("🤳 Selfie saved:", updateData.selfieUrl);
    }

    // Update customer with all data
    await customer.update(updateData, { transaction });

    await transaction.commit();

    console.log("✅ Guarantors and ID info saved successfully for customer:", customerId);

    return res.status(200).json({ 
      success: true, 
      message: "Guarantors and ID information saved successfully",
      customerId,
      nextStep: 4,
      uploadedFiles: {
        idPhoto: updateData.idPhotoUrl || null,
        selfie: updateData.selfieUrl || null
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error in signupGuarantorsAndId:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error. Please try again.",
      error: error.message
    });
  }
};

// STEP 4 - Finalize (unchanged)
const finalizeSignup = async (req, res) => {
  console.log("🎯 Finalizing signup");
  
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  const transaction = await sequelize.transaction();

  try {
    const { customerId } = req.body;

    const customer = await Customer.findByPk(customerId, { transaction });
    
    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false, 
        message: "Customer not found" 
      });
    }

    if (customer.signupStep < 3) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: "Please complete all previous steps first" 
      });
    }

    await customer.update({
      role: "customer",
      signupStep: 4,
      isSignupComplete: true,
      signupCompletedAt: new Date()
    }, { transaction });

    await transaction.commit();

    console.log("🎉 Signup completed successfully for customer:", customerId);

    return res.status(200).json({ 
      success: true, 
      message: "Signup completed successfully! Welcome aboard!",
      customerId,
      isComplete: true
    });

  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error in finalizeSignup:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error. Please try again." 
    });
  }
};

// Helper function to get signup progress (unchanged)
const getSignupProgress = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findByPk(customerId, {
      attributes: [
        "id",
        "signupStep",
        "isSignupComplete",

        // personal info
        "firstName",
        "middleName",
        "lastName",
        "emailAddress",
        "phoneNumber",
        "birthday",
        "gender",

        // address
        "houseNumber",
        "street",
        "barangay",
        "town",
        "province",
        "country",
        "zipCode",

        // guarantors
        "guarantor1FullName",
        "guarantor1Address",
        "guarantor1MobileNumber",
        "guarantor2FullName",
        "guarantor2Address",
        "guarantor2MobileNumber",

        // ID upload
        "idType",
        "idNumber",
        "idPhotoUrl",
        "selfieUrl",
      ],
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    console.log("📊 Returning customer data:", customer.toJSON());

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("❌ Error in getSignupProgress:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const fetchCustomers = async (req, res) => {
  try{
    const response = await Customer.findAll();
    return res.status(200).json({success:true, message:response});
  } catch (error) {
    return res.status(500).json({success:false, message:error});
  }
};

export { 
  signupPersonalInfo, 
  signupAddress, 
  signupGuarantorsAndId, 
  finalizeSignup,
  getSignupProgress,
  fetchCustomers 
};