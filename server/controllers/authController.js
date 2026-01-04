import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Customer from '../models/Customer.js';
import Owner from '../models/Owner.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';



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
        profileImage: customer.idPhoto,
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

// Assuming you have a User model - adjust import based on your setup
// import User from '../models/User.js';

// Store reset tokens temporarily (in production, use Redis or database)
const resetTokens = new Map();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASSWORD, // your email password or app password
  },
});

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Check if user exists in database
    // Replace this with your actual database query
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Store token with expiry (in production, store in database)
    resetTokens.set(email.toLowerCase(), {
      token: resetToken,
      expiry: resetTokenExpiry,
      userId: user._id,
    });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #057474;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #057474; 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 5px;
                      display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #057474; word-break: break-all;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #888; font-size: 12px;">
            This is an automated email, please do not reply.
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while processing your request. Please try again later.',
    });
  }
};

// Additional function to verify reset token (for the reset password page)
const verifyResetToken = async (req, res) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reset link',
      });
    }

    const storedToken = resetTokens.get(email.toLowerCase());

    if (!storedToken) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset link',
      });
    }

    if (storedToken.token !== token) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reset link',
      });
    }

    if (Date.now() > storedToken.expiry) {
      resetTokens.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        error: 'Reset link has expired',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
    });

  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred',
    });
  }
};

// Function to actually reset the password
const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
      });
    }

    const storedToken = resetTokens.get(email.toLowerCase());

    if (!storedToken || storedToken.token !== token) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset link',
      });
    }

    if (Date.now() > storedToken.expiry) {
      resetTokens.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        error: 'Reset link has expired',
      });
    }

    // Update user password in database
    // Replace with your actual password hashing and database update
    const user = await User.findById(storedToken.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Hash password (assuming you have bcrypt)
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Remove used token
    resetTokens.delete(email.toLowerCase());

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while resetting password',
    });
  }
};

export { 
  login, 
  verify, 
  mobileUserLogin, 
  mobileOwnerLogin, 
  forgotPassword,
  verifyResetToken,
  resetPassword
};

