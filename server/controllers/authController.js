import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Customer from '../models/Customer.js';
import Owner from '../models/Owner.js';
import bcrypt from 'bcryptjs';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(req.body);

    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }


    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Wrong password' });
    }

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_KEY,
      { expiresIn: '10d' }
    );

    console.log(`${admin.email}, successfully logged in`);

    res.status(200).json({
      success: true,
      token,
      user: { id: admin.id, name: admin.name, role: admin.role },
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const verify = (req, res) => {
  return res.status(200).json({ success: true, admin: req.admin });
};

const mobileUserLogin = async (req, res) => {
  console.log("Trying to login using mobileUserLogin");
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", req.body);

    // 🔹 Use emailAddress instead of email (since that's your DB column)
    const customer = await Customer.findOne({ where: { emailAddress: email } });

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    // 🔹 CHECK EMAIL VERIFICATION STATUS - PREVENT UNVERIFIED USERS FROM LOGGING IN
    if (!customer.isVerified) {
      console.log(`Login blocked for unverified user: ${customer.emailAddress}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Please verify your email address before logging in. Check your inbox for the verification link.' 
      });
    }

    // 🔹 Compare passwords
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Wrong password' });
    }

    // 🔹 Generate JWT with role = customer
    const token = jwt.sign(
      { id: customer.id, role: 'customer' },
      process.env.JWT_KEY,
      { expiresIn: '10d' }
    );

    console.log(`${customer.emailAddress}, successfully logged in`);

    // 🔹 Send response (build full name)
    res.status(200).json({
      success: true,
      token,
      user: { 
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
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
        role: 'customer'
      },
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const mobileOwnerLogin = async (req, res) => {
  console.log("Trying to login using mobileOwnerLogin");
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", req.body);

    const owner = await Owner.findOne({ where: { email } });

    if (!owner) {
      return res.status(404).json({ success: false, error: 'Owner not found' });
    }

    // Compare passwords correctly
    const isMatch = await bcrypt.compare(password, owner.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Wrong password' });
    }

    // Generate JWT with role = owner
    const token = jwt.sign(
      { id: owner.id, role: 'owner' },
      process.env.JWT_KEY,
      { expiresIn: '10d' }
    );

    console.log(`${owner.email}, successfully logged in`);

    // Send complete user data that matches frontend expectations
    res.status(200).json({
      success: true,
      token,
      user: { 
        id: owner.id, 
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.email,
        phone: owner.phone || null,
        address: owner.address || null,
        profileImage: owner.profileImage || null,
        gcashQR: owner.gcashQR || null,
        bio: owner.bio || null,
        isVerified: owner.isVerified || false,
        role: 'owner'
      },
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


export { login, verify, mobileUserLogin, mobileOwnerLogin};