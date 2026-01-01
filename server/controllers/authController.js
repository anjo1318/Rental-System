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
  console.log('Trying to login using mobileUserLogin');

  try {
    const { email, password, pushToken, platform } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Find customer
    const customer = await Customer.findOne({
      where: { emailAddress: email },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    // Check verification
    if (!customer.isVerified) {
      return res.status(403).json({
        success: false,
        error: 'Your account is not yet verified. Please wait for approval.',
      });
    }

    // Check active status
    if (!customer.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password',
      });
    }

    // 🔔 SAVE / UPDATE PUSH TOKEN (OPTIONAL BUT RECOMMENDED)
    if (pushToken && platform) {
      await PushToken.upsert({
        customerId: customer.id,
        token: pushToken,
        platform,
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: customer.id, role: 'customer' },
      process.env.JWT_KEY,
      { expiresIn: '10d' }
    );

    // Success
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: customer.id,
        role: 'customer',
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
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred during login. Please try again later.',
    });
  }
};


const mobileOwnerLogin = async (req, res) => {
  console.log("Trying to login using mobileOwnerLogin");
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", req.body);

    // ✅ Now works with 'email' because of field alias
    const owner = await Owner.findOne({ where: { email } });

    if (!owner) {
      return res.status(404).json({ success: false, error: 'Owner not found' });
    }

    // ✅ Compare passwords with 'password' field
    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Wrong password' });
    }

    const token = jwt.sign(
      { id: owner.id, role: 'owner' },
      process.env.JWT_KEY,
      { expiresIn: '10d' }
    );

    console.log(`${owner.email}, successfully logged in`);

    res.status(200).json({
      success: true,
      token,
      user: { 
        id: owner.id, 
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.email, // ✅ Now works
        phone: owner.phone, // ✅ Now works
        address: owner.street 
          ? `${owner.houseNumber || ''} ${owner.street}, ${owner.barangay}, ${owner.town}, ${owner.province}`.trim() 
          : null,
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