import Customer from "../models/Customer.js";
import Owner from "../models/Owner.js";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
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
    idType,
    idNumber,
    role,
  } = req.body;

  try {
    console.log("📩 Incoming request to /customer/signup");
    console.log("📌 Request body:", req.body);
    console.log("📂 Request files:", req.files);
    console.log("👤 Role:", role);

    if (
      !firstName ||
      !lastName ||
      !emailAddress ||
      !phoneNumber ||
      !birthday ||
      !gender ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields are missing: firstName, lastName, emailAddress, phoneNumber, birthday, gender, password",
      });
    }

    if (!role || !["customer", "owner"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'customer' or 'owner'",
      });
    }

    // ✅ Cloudinary URLs
    const idPhotoFile = req.files?.photoId?.[0] || null;
    const selfieFile = req.files?.selfie?.[0] || null;
    const idPhotoUrl = idPhotoFile ? idPhotoFile.path : null;
    const selfieUrl = selfieFile ? selfieFile.path : null;

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "owner") {
      // ✅ Check if email exists in Owner
      const existingOwner = await Owner.findOne({ where: { emailAddress } });
      if (existingOwner) {
        return res
          .status(409)
          .json({ success: false, message: "Email address already exists" });
      }

      const owner = await Owner.create({
        firstName,
        middleName: middleName || "N/A",
        lastName,
        email: emailAddress, // ✅ use 'email' not 'emailAddress'
        phone: phoneNumber, // ✅ use 'phone' not 'phoneNumber'
        birthday,
        gender,
        password: hashedPassword,
        houseNumber: houseNumber || "N/A",
        street: street || "N/A",
        barangay: barangay || "N/A",
        town: town || "N/A",
        province: province || "N/A",
        country: country || "Philippines",
        zipCode: zipCode || "N/A",
        idType: idType && idType !== "" ? idType : null,
        idNumber: idNumber || "N/A",
        idPhoto: idPhotoUrl,
        selfie: selfieUrl,
        isActive: true,
        isVerified: false,
        gcashQR: "N/A",
      });

      console.log("✅ Owner created successfully with ID:", owner.id);

      return res.status(201).json({
        success: true,
        message: "Owner signup completed successfully",
        ownerId: owner.id,
        idPhoto: idPhotoUrl,
        selfie: selfieUrl,
      });
    } else {
      // ✅ Check if email exists in Customer
      const existingCustomer = await Customer.findOne({
        where: { emailAddress },
      });
      if (existingCustomer) {
        return res
          .status(409)
          .json({ success: false, message: "Email address already exists" });
      }

      const customer = await Customer.create({
        firstName,
        middleName: middleName || "N/A",
        lastName,
        emailAddress,
        phoneNumber,
        birthday,
        gender,
        password: hashedPassword,
        houseNumber: houseNumber || "N/A",
        street: street || "N/A",
        barangay: barangay || "N/A",
        town: town || "N/A",
        province: province || "N/A",
        country: country || "Philippines",
        zipCode: zipCode || "N/A",
        idType: idType || null,
        idNumber: idNumber || "N/A",
        idPhoto: idPhotoUrl,
        selfie: selfieUrl,
        isActive: true,
        isVerified: false,
        isRenting: false,
      });

      console.log("✅ Customer created successfully with ID:", customer.id);

      return res.status(201).json({
        success: true,
        message: "Customer signup completed successfully",
        customerId: customer.id,
        idPhoto: idPhotoUrl,
        selfie: selfieUrl,
      });
    }
  } catch (error) {
    console.error("❌ Error during signup:", error);

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

    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ success: false, message: "Email address already exists" });
    }

    return res
      .status(500)
      .json({ success: false, message: "Internal server error during signup" });
  }
};

const getCustomerProgress = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📊 Fetching customer progress for ID: ${id}`);

    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

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
      // ✅ Cloudinary URLs are stored directly, no need to build them
      idPhotoUrl: customer.idPhoto || null,
      selfieUrl: customer.selfie || null,
      isActive: customer.isActive,
      isVerified: customer.isVerified,
    };

    console.log("✅ Customer data retrieved successfully");

    return res.status(200).json({
      success: true,
      customer: customerData,
    });
  } catch (error) {
    console.error("❌ Error fetching customer progress:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const fetchCustomers = async (req, res) => {
  try {
    const response = await Customer.findAll();
    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    return res.status(500).json({ success: false, message: error });
  }
};

const updateCustomerDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    await customer.update({
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      lastName: req.body.lastName,
      emailAddress: req.body.emailAddress,
      phoneNumber: req.body.phoneNumber,
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

    const formattedCustomer = {
      id: customer.id,
      firstName: customer.firstName,
      middleName: customer.middleName,
      lastName: customer.lastName,
      email: customer.emailAddress,
      phone: customer.phoneNumber,
      profileImage: customer.idPhoto,
      birthday: customer.birthday,
      gender: customer.gender,
      houseNumber: customer.houseNumber,
      street: customer.street,
      barangay: customer.barangay,
      town: customer.town,
      province: customer.province,
      country: customer.country,
      zipCode: customer.zipCode,
      role: "customer",
      isVerified: customer.isVerified,
      address: "",
      bio: null,
      gcashQR: customer.gcashQR || "N/A",
    };

    console.log("Customer detail updated successfully");

    return res.status(200).json({
      success: true,
      message: "Customer details updated",
      updatedCustomer: formattedCustomer,
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const uploadCustomerPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No photo uploaded" });
    }

    // ✅ Store full Cloudinary URL directly
    await customer.update({ idPhoto: req.file.path });

    return res.status(200).json({
      success: true,
      message: "Photo updated successfully",
      photoUrl: req.file.path,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ success: false, message: "Upload failed" });
  }
};

export {
  fetchCustomers,
  updateCustomerDetails,
  customerSignUp,
  getCustomerProgress,
  uploadCustomerPhoto,
};
