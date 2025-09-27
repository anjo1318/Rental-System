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
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory with absolute path
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files with absolute path
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Debug route to check what files exist
app.get('/debug/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    res.json({ 
      uploadDir,
      files,
      exists: fs.existsSync(uploadDir)
    });
  } catch (error) {
    res.json({ error: error.message, uploadDir });
  }
});

// Your other middleware and routes...

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});


// ✅ IMPORTANT: Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// ✅ REMOVED: The duplicate route handler - it's now in customer router

// Routers
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/auth', authRouter);
app.use('/api/customer', customerRouter);
app.use('/api/item', itemRouter);
app.use('/api/chat', chatRouter);
app.use('/api/book', bookRouter);

// Database + Server Start
connectToDatabase();
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Static files served from: ${uploadDir}`);
  console.log(`🌐 Health check: http://localhost:${PORT}`);
});