import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        error: "Authorization header is missing" 
      });
    }

    // Check if header is in correct format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid Authorization header format. Use 'Bearer <token>'" 
      });
    }

    const token = parts[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_KEY);
    } catch (jwtError) {
      // Handle different JWT errors
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          error: "Token has expired" 
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          error: "Invalid token" 
        });
      }
      throw jwtError; // Re-throw other unexpected errors
    }

    const admin = await Admin.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    // Check if user exists
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        error: "Admin associated with token not found" 
      });
    }


    req.admin = admin.toJSON(); // Convert to plain object
    req.token = token;

    // Logging (optional, can be removed in production)
    console.log("Authentication successful:");
    console.log("Admin ID:", admin.id);
    console.log("Admin Email:", admin.email);
    console.log("Token Expiration:", new Date(decoded.exp * 1000).toLocaleString());

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Internal server authentication error" 
    });
  }
};

export default verifyAdmin;