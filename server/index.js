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
import reviewRouter from './routes/review.js';
import returnRouter from './routes/return.js';
import historyRouter from './routes/history.js';
import dashboardRouter from './routes/dashboard.js';
import loginHistoryRouter from './routes/loginHistory.js';
import { restoreActiveTimers, setupRentalMonitoring } from './controllers/bookController.js';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Safe upload path: use env var (Render disk) or fallback to local
const uploadDir = process.env.UPLOAD_PATH
  ? process.env.UPLOAD_PATH
  : path.join(process.cwd(), 'uploads');

const imageUploadDir = path.join(uploadDir, 'images');

// ✅ Safe directory creation with error handling
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 Created upload directory: ${uploadDir}`);
  }
  if (!fs.existsSync(imageUploadDir)) {
    fs.mkdirSync(imageUploadDir, { recursive: true });
    console.log(`📁 Created images directory: ${imageUploadDir}`);
  }
} catch (err) {
  console.error(`❌ Failed to create upload directories:`, err.message);
  process.exit(1);
}

// ------------------ Middleware ------------------

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ✅ Serve static files from the SAME directory where files are saved
app.use('/uploads', express.static(uploadDir));

// ✅ Debug route to verify uploads are working
app.get('/debug/uploads', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    const imageFiles = fs.readdirSync(imageUploadDir);
    res.json({ uploadDir, imageUploadDir, files, imageFiles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
app.use('/api/review', reviewRouter);
app.use('/api/return', returnRouter);
app.use('/api/history', historyRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/login-history', loginHistoryRouter);

// ------------------ 404 Handler ------------------

app.use((req, res) => {
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
      console.log(`📁 Upload directory: ${uploadDir}`);
      console.log(`🖼️  Images directory: ${imageUploadDir}`);
      console.log(`🌐 Health check: ${PUBLIC_URL}`);
      console.log(`📸 Upload endpoint: ${PUBLIC_URL}/api/upload/image`);
      
      console.log('⏰ Restoring deadline timers...');
      await restoreActiveTimers();
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

setupRentalMonitoring();