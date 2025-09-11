import express from 'express'; 
import dotenv from 'dotenv';
import { connectToDatabase } from './database/database.js';
import adminRouter from './routes/admin.js';
import userRouter from './routes/user.js';
import ownerRouter from './routes/owner.js';
import authRouter from './routes/auth.js';
import customerRouter from './routes/customer.js';
import itemRouter from './routes/item.js';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// Example test route
app.post(
  "/api/customer/sign-up/guarantors-id",
  upload.fields([
    { name: "photoId", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const body = req.body;
      const files = req.files;

      console.log("✅ Received data:", body);
      console.log("✅ Received files:", files);

      res.json({
        success: true,
        message: "Guarantors and ID uploaded successfully",
        data: {
          ...body,
          photoId: files?.photoId?.[0]?.path,
          selfie: files?.selfie?.[0]?.path,
        },
      });
    } catch (err) {
      console.error("❌ Upload error:", err);
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  }
);

// Routers
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/auth', authRouter);
app.use('/api/customer', customerRouter);
app.use('/api/item', itemRouter);

// Database + Server Start
connectToDatabase();
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
