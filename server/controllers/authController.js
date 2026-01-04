// authController.js - Updated forgotPassword function

import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Customer from '../models/Customer.js';
import Owner from '../models/Owner.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Store reset tokens temporarily (in production, consider using Redis or a database table)
const resetTokens = new Map();





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

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Changed from EMAIL_PASSWORD to EMAIL_PASS
  },
});

// Test email connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
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

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address',
      });
    }

    const normalizedEmail = email.toLowerCase();
    let user = null;
    let userType = null;
    let userEmail = null;

    // Check if user is a Customer
    const customer = await Customer.findOne({ 
      where: { emailAddress: normalizedEmail } 
    });

    if (customer) {
      user = customer;
      userType = 'customer';
      userEmail = customer.emailAddress;
    }

    // If not found as Customer, check Owner
    if (!user) {
      const owner = await Owner.findOne({ 
        where: { email: normalizedEmail } 
      });

      if (owner) {
        user = owner;
        userType = 'owner';
        userEmail = owner.email;
      }
    }

    // If not found as Owner, check Admin
    if (!user) {
      const admin = await Admin.findOne({ 
        where: { email: normalizedEmail } 
      });

      if (admin) {
        user = admin;
        userType = 'admin';
        userEmail = admin.email;
      }
    }

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

    // Store token with expiry and user info
    resetTokens.set(normalizedEmail, {
      token: resetToken,
      expiry: resetTokenExpiry,
      userId: user.id,
      userType: userType, // Store user type to know which table to update
    });

    // Create reset URL - adjust based on your mobile app deep linking
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Get user's name for personalization
    let userName = 'User';
    if (userType === 'customer') {
      userName = user.firstName || 'User';
    } else if (userType === 'owner') {
      userName = user.firstName || 'User';
    } else if (userType === 'admin') {
      userName = user.name || 'Admin';
    }

    // Email content
    const mailOptions = {
      from: `"Rental System" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Password Reset Request - Rental System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #057474; padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Password Reset Request</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Hello ${userName},
                      </p>
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        We received a request to reset your password for your Rental System account. Click the button below to reset it:
                      </p>
                      
                      <!-- Button -->
                      <table role="presentation" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetUrl}" 
                               style="background-color: #057474; 
                                      color: #ffffff; 
                                      padding: 15px 40px; 
                                      text-decoration: none; 
                                      border-radius: 25px;
                                      display: inline-block;
                                      font-size: 16px;
                                      font-weight: 600;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="color: #057474; font-size: 14px; word-break: break-all; background-color: #f9f9f9; padding: 10px; border-radius: 5px;">
                        ${resetUrl}
                      </p>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 10px 0;">
                        <strong>This link will expire in 1 hour.</strong>
                      </p>
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0;">
                        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9f9f9; padding: 20px 30px; border-top: 1px solid #e0e0e0;">
                      <p style="color: #888888; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                        This is an automated email, please do not reply.<br>
                        © ${new Date().getFullYear()} Rental System. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`✅ Password reset email sent to: ${userEmail} (${userType})`);

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while processing your request. Please try again later.',
    });
  }
};

// Verify reset token validity
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
        error: 'Reset link has expired. Please request a new one.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
    });

  } catch (error) {
    console.error('❌ Verify reset token error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred',
    });
  }
};

// Actually reset the password
const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    // Validate inputs
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

    const normalizedEmail = email.toLowerCase();
    const storedToken = resetTokens.get(normalizedEmail);

    if (!storedToken || storedToken.token !== token) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset link',
      });
    }

    if (Date.now() > storedToken.expiry) {
      resetTokens.delete(normalizedEmail);
      return res.status(400).json({
        success: false,
        error: 'Reset link has expired. Please request a new one.',
      });
    }

    // Find user based on userType
    let user = null;
    const { userType, userId } = storedToken;

    if (userType === 'customer') {
      user = await Customer.findOne({ where: { id: userId } });
    } else if (userType === 'owner') {
      user = await Owner.findOne({ where: { id: userId } });
    } else if (userType === 'admin') {
      user = await Admin.findOne({ where: { id: userId } });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Hash password (using bcryptjs which you already have)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password using Sequelize
    await user.update({ 
      password: hashedPassword 
    });

    // Remove used token
    resetTokens.delete(normalizedEmail);

    console.log(`✅ Password reset successful for: ${email} (${userType})`);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while resetting password',
    });
  }
};

// Clean up expired tokens periodically (optional but recommended)
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of resetTokens.entries()) {
    if (now > data.expiry) {
      resetTokens.delete(email);
      console.log(`🧹 Cleaned up expired token for: ${email}`);
    }
  }
}, 3600000); // Run every hour

export { 
  login, 
  verify, 
  mobileUserLogin, 
  mobileOwnerLogin, 
  forgotPassword,
  verifyResetToken,
  resetPassword
};