import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Customer from '../models/Customer.js';
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




const mobileLogin = async (req, res) => {
  console.log("Trying to login using mobileLogin");
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", req.body);

    // 🔹 Use emailAddress instead of email (since that's your DB column)
    const customer = await Customer.findOne({ where: { emailAddress: email } });

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
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
        role: 'customer' 
      },
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};







export { login, verify, mobileLogin};