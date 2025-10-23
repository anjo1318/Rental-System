// routes/upload.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------ Authentication ------------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_KEY);
    req.user = decoded;
    console.log(`🔐 Authenticated user for upload:`, decoded.id);
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

// ------------------ Upload Directory Setup ------------------

// Use persistent disk on Render, or fallback to local uploads folder
const baseUploadPath = process.env.UPLOAD_PATH || '/persistent_uploads';
const uploadsDir = path.join(baseUploadPath, 'images');

// Ensure directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`📁 Created images upload directory: ${uploadsDir}`);
} else {
  console.log(`📁 Using existing upload directory: ${uploadsDir}`);
}

// ------------------ Multer Configuration ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `item-${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  allowedTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ------------------ Routes ------------------

// ✅ Single image upload
router.post('/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/images/${req.file.filename}`;

    console.log(`📸 Image uploaded successfully: ${req.file.filename}`);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to upload image' });
  }
});

// ✅ Multiple images upload
router.post('/images', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ success: false, error: 'No image files provided' });
    }

    const imageUrls = req.files.map((file) => ({
      url: `${req.protocol}://${req.get('host')}/uploads/images/${file.filename}`,
      filename: file.filename,
      size: file.size,
    }));

    console.log(`📸 ${req.files.length} images uploaded successfully`);

    res.status(200).json({
      success: true,
      message: `${req.files.length} images uploaded successfully`,
      images: imageUrls,
      imageUrls: imageUrls.map((img) => img.url),
    });
  } catch (error) {
    console.error('Multiple images upload error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to upload images' });
  }
});

// ✅ Delete image
router.delete('/image/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    fs.unlinkSync(imagePath);
    console.log(`🗑️ Image deleted: ${filename}`);

    res.status(200).json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete image' });
  }
});

// ------------------ Error Handling ------------------
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File too large. Maximum size is 5MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ success: false, error: 'Too many files. Maximum is 5 images.' });
    }
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.status(500).json({ success: false, error: 'Upload failed' });
});

export default router;
