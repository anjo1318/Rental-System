import Customer from "../models/Customer.js";
import bcrypt from "bcryptjs";
import { validationResult } from 'express-validator';
import sequelize from "../database/database.js";

const customerSignUp = async (req, res) => {
  const {
    firstName, 
    middleName, 
    lastName, 
    emailAddress, 
    phoneNumber, 
    birthday, 
    gender, 
    password, 
    houseNumber, 
    street, 
    barangay, 
    town, 
    province,
    country, 
    zipCode, 
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

  console.log("Incoming data for signup", req.body);
  
  try {
    // Input validation
    if (!firstName || !lastName || !emailAddress || !phoneNumber || !birthday || !gender || !password) {
      return res.status(400).json({
        success: false, 
        message: "Required fields are missing: firstName, lastName, emailAddress, phoneNumber, birthday, gender, password"
      });
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ 
      where: { emailAddress: emailAddress } 
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false, 
        message: "Email address already exists"
      });
    }

    // Hash the password correctly
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new customer
    const response = await Customer.create({
      firstName, 
      middleName,
      lastName,
      emailAddress,
      phoneNumber,
      birthday,
      gender,
      password: hashedPassword,
      houseNumber,
      street,
      barangay,
      town,
      province,
      country: country || 'Philippines', // Default value
      zipCode,
      guarantor1FullName,
      guarantor1Address,
      guarantor1MobileNumber,
      guarantor2FullName,
      guarantor2Address,
      guarantor2MobileNumber,
      idType,
      idNumber,
      idPhoto,
      isActive: true,
      isVerified: false
    });

    console.log("✅ Customer created successfully:", response.id);

    // Return success response (don't send sensitive data like password)
    return res.status(201).json({
      success: true, 
      message: "Customer signup completed successfully",
      customerId: response.id
    });

  } catch (error) {
    console.error("❌ Error during customer signup:", error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false, 
        message: "Validation failed",
        errors: validationErrors
      });
    }
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false, 
        message: "Email address already exists"
      });
    }
    
    // Generic error response
    return res.status(500).json({
      success: false, 
      message: "Internal server error during signup"
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

const updateCustomerDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    // Update fields with request body
    await customer.update({
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      birthday: req.body.birthday,
      gender: req.body.gender,
      houseNumber: req.body.houseNumber,
      street: req.body.street,
      barangay: req.body.barangay,
      town: req.body.town,
      province: req.body.province,
      country: req.body.country,
      zipCode: req.body.zipCode,
    });

    console.log("After the request", customer);

    console.log("Customer detail updated successfully");

    return res.status(200).json({ success: true, message: "Customer details updated", updatedCustomer: customer });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export { 
  fetchCustomers,
  updateCustomerDetails ,
  customerSignUp
};