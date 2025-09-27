import express from 'express'; 
import dotenv from 'dotenv';
import { connectToDatabase } from './database/database.js';
import adminRouter from './routes/admin.js';
import userRouter from './routes/user.js';
import ownerRouter from './routes/owner.js';
import authRouter from './routes/auth.js';
import customerRouter from './routes/customer.js';
import itemRouter from './routes/item.js';
import chatRouter from './routes/chat.js';
import bookRouter from './routes/book.js';
import uploadRouter from './routes/upload.js'
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Create uploads directory structure
const uploadDir = path.join(__dirname, "uploads");
const imageUploadDir = path.join(uploadDir, "images");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Created uploads directory: ${uploadDir}`);
}

if (!fs.existsSync(imageUploadDir)) {
  fs.mkdirSync(imageUploadDir, { recursive: true });
  console.log(`📁 Created images directory: ${imageUploadDir}`);
}

// Serve static files - cleaned up to avoid duplicates
app.use("/uploads", express.static(uploadDir));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Debug routes
app.get("/debug/uploads", (req, res) => {
  const uploadPath = path.join(__dirname, "uploads");
  fs.readdir(uploadPath, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ files, uploadPath });
  });
});

app.get('/debug/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    const imageFiles = fs.existsSync(imageUploadDir) ? fs.readdirSync(imageUploadDir) : [];
    res.json({ 
      uploadDir,
      imageUploadDir,
      files,
      imageFiles,
      exists: fs.existsSync(uploadDir)
    });
  } catch (error) {
    res.json({ error: error.message, uploadDir });
  }
});

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Rental System API is running',
    timestamp: new Date().toISOString(),
    uploadsEnabled: fs.existsSync(imageUploadDir)
  });
});

// API Routes
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/auth', authRouter);
app.use('/api/customer', customerRouter);
app.use('/api/item', itemRouter);
app.use('/api/chat', chatRouter);
app.use('/api/book', bookRouter);
app.use('/api/upload', uploadRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});


// Database + Server Start
connectToDatabase();
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Static files served from: ${uploadDir}`);
  console.log(`🖼️  Images directory: ${imageUploadDir}`);
  console.log(`🌐 Health check: http://localhost:${PORT}`);
  console.log(`📸 Upload endpoint: http://localhost:${PORT}/api/upload/image`);
});