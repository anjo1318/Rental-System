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
import messageRouter from './routes/message.js';
import bookRouter from './routes/book.js';
import uploadRouter from './routes/upload.js';
import paymentRouter from './routes/payment.js';
// ✨ Import the timer restoration function
import { restoreActiveTimers, setupRentalMonitoring } from './controllers/bookController.js';
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

// ------------------ Middleware ------------------

// Allow everyone to access (all origins)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // optional, remove if not using cookies
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});



const uploadDir = process.env.UPLOAD_PATH || '/persistent_uploads';
const imageUploadDir = path.join(uploadDir, 'images');



// Create directories if they don't exist
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(imageUploadDir)) fs.mkdirSync(imageUploadDir, { recursive: true });

// Serve static files
app.use('/uploads', express.static(uploadDir));

// Debug routes (optional)
app.get('/debug/uploads', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ files, uploadDir, imageFiles: fs.readdirSync(imageUploadDir) });
  });
});

// ------------------ Health Check ------------------

app.get('/', (req, res) => {
  res.json({ 
    message: 'Rental System API is running',
    timestamp: new Date().toISOString(),
    uploadsEnabled: fs.existsSync(imageUploadDir)
  });
});

// ------------------ API Routes ------------------

app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/auth', authRouter);
app.use('/api/customer', customerRouter);
app.use('/api/item', itemRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);
app.use('/api/book', bookRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/payment', paymentRouter);

// ------------------ 404 Handler ------------------

app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ------------------ Error Handler ------------------

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// ------------------ Database + Server Start ------------------

connectToDatabase()
  .then(async () => {
    app.listen(PORT, async () => {
      const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📁 Static files served from: ${uploadDir}`);
      console.log(`🖼️  Images directory: ${imageUploadDir}`);
      console.log(`🌐 Health check: ${PUBLIC_URL}`);
      console.log(`📸 Upload endpoint: ${PUBLIC_URL}/api/upload/image`);
      
      // ✨ Restore deadline timers on server start
      console.log('⏰ Restoring deadline timers...');
      await restoreActiveTimers();
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

  setupRentalMonitoring();