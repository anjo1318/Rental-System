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
  } = req.body;

  try {
    // ✅ Input validation
    if (!firstName || !lastName || !emailAddress || !phoneNumber || !birthday || !gender || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields are missing: firstName, lastName, emailAddress, phoneNumber, birthday, gender, password",
      });
    }

    // ✅ Check if email already exists
    const existingCustomer = await Customer.findOne({
      where: { emailAddress },
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Email address already exists",
      });
    }

    // ✅ Handle uploaded files
    const idPhotoFile = req.files?.photoId?.[0] || null;
    const selfieFile = req.files?.selfie?.[0] || null;

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const idPhotoUrl = idPhotoFile ? `${baseUrl}/uploads/${idPhotoFile.filename}` : null;
    const selfieUrl = selfieFile ? `${baseUrl}/uploads/${selfieFile.filename}` : null;

    console.log("Incoming data for signup:", req.body);
    console.log("Uploaded files:", req.files);
    console.log("ID Photo URL:", idPhotoUrl);
    console.log("Selfie URL:", selfieUrl);

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new customer
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
      country: country || "Philippines",
      zipCode,
      guarantor1FullName,
      guarantor1Address,
      guarantor1MobileNumber,
      guarantor2FullName,
      guarantor2Address,
      guarantor2MobileNumber,
      idType,
      idNumber,
      idPhoto: idPhotoUrl, // ✅ Save public URL
      selfie: selfieUrl,   // ✅ Save public URL
      isActive: true,
      isVerified: false,
    });

    console.log("Customer created successfully:", response.id);

    return res.status(201).json({
      success: true,
      message: "Customer signup completed successfully",
      customerId: response.id,
      idPhoto: idPhotoUrl,
      selfie: selfieUrl,
    });
  } catch (error) {
    console.error("Error during customer signup:", error);

    // ✅ Handle Sequelize validation errors
    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // ✅ Handle unique constraint errors
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Email address already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error during signup",
    });
  }
};


// ✅ ADD THIS NEW FUNCTION - This is what your frontend is calling
const getCustomerProgress = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📊 Fetching customer progress for ID: ${id}`);
    
    const customer = await Customer.findByPk(id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    // Return customer data without sensitive info like password
    const customerData = {
      id: customer.id,
      firstName: customer.firstName,
      middleName: customer.middleName,
      lastName: customer.lastName,
      emailAddress: customer.emailAddress,
      phoneNumber: customer.phoneNumber,
      birthday: customer.birthday,
      gender: customer.gender,
      houseNumber: customer.houseNumber,
      street: customer.street,
      barangay: customer.barangay,
      town: customer.town,
      province: customer.province,
      country: customer.country,
      zipCode: customer.zipCode,
      guarantor1FullName: customer.guarantor1FullName,
      guarantor1Address: customer.guarantor1Address,
      guarantor1MobileNumber: customer.guarantor1MobileNumber,
      guarantor2FullName: customer.guarantor2FullName,
      guarantor2Address: customer.guarantor2Address,
      guarantor2MobileNumber: customer.guarantor2MobileNumber,
      idType: customer.idType,
      idNumber: customer.idNumber,
      // For images, you might need to construct full URLs
      idPhotoUrl: customer.idPhoto ? `${req.protocol}://${req.get('host')}/uploads/${customer.idPhoto}` : null,
      selfieUrl: customer.selfie ? `${req.protocol}://${req.get('host')}/uploads/${customer.selfie}` : null,
      isActive: customer.isActive,
      isVerified: customer.isVerified
    };

    console.log("✅ Customer data retrieved successfully");

    return res.status(200).json({
      success: true,
      customer: customerData
    });

  } catch (error) {
    console.error("❌ Error fetching customer progress:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const fetchCustomers = async (req, res) => {
  try{
    const response = await Customer.findAll();
    return res.status(200).json({success:true, data:response});
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
      emailAddress: req.body.emailAddress, // Fixed: was 'email', should be 'emailAddress'
      phoneNumber: req.body.phoneNumber,   // Fixed: was 'phone', should be 'phoneNumber'
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

    return res.status(200).json({ 
      success: true, 
      message: "Customer details updated", 
      updatedCustomer: customer 
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export { 
  fetchCustomers,
  updateCustomerDetails,
  customerSignUp,
  getCustomerProgress  // ✅ ADD THIS TO EXPORTS
};