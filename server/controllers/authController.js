import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
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






export { login, verify };