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

// STEP 1 - Personal Info
const signupPersonalInfo = async (req, res) => {
  console.log("🚀 Starting personal info signup");
  
  // Check for validation errors
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

    // Check if user already exists
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new customer
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

// STEP 2 - Address
const signupAddress = async (req, res) => {
  console.log("🏠 Starting address signup");
  
  // Check for validation errors
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

    // Find customer and verify they're on the correct step
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

    // Update address information
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

// STEP 3 - Guarantors + ID
const signupGuarantorsAndId = async (req, res) => {
  console.log("👥 Starting guarantors and ID signup");
  
  // Check for validation errors
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

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
      idNumber, 
      idPhoto 
    } = req.body;

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

    // Update guarantor and ID information
    await customer.update({
      guarantor1FullName,
      guarantor1Address,
      guarantor1MobileNumber,
      guarantor2FullName,
      guarantor2Address,
      guarantor2MobileNumber,
      idType,
      idNumber,
      idPhoto,
      signupStep: 3
    }, { transaction });

    await transaction.commit();

    console.log("✅ Guarantors and ID info saved successfully for customer:", customerId);

    return res.status(200).json({ 
      success: true, 
      message: "Guarantors and ID information saved successfully",
      customerId,
      nextStep: 4
    });

  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error in signupGuarantorsAndId:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error. Please try again." 
    });
  }
};

// STEP 4 - Finalize
const finalizeSignup = async (req, res) => {
  console.log("🎯 Finalizing signup");
  
  // Check for validation errors
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  const transaction = await sequelize.transaction();

  try {
    const { customerId } = req.body;

    // Find customer and verify they've completed all previous steps
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

    // Finalize signup
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

// Helper function to get signup progress
const getSignupProgress = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findByPk(customerId, {
      attributes: ['id', 'signupStep', 'isSignupComplete', 'firstName', 'lastName']
    });

    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: "Customer not found" 
      });
    }

    return res.status(200).json({
      success: true,
      customerId: customer.id,
      currentStep: customer.signupStep,
      isComplete: customer.isSignupComplete,
      customerName: `${customer.firstName} ${customer.lastName}`
    });

  } catch (error) {
    console.error("❌ Error in getSignupProgress:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export { 
  signupPersonalInfo, 
  signupAddress, 
  signupGuarantorsAndId, 
  finalizeSignup,
  getSignupProgress 
};