import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// ------------------ Cloudinary Config ------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ------------------ Authentication ------------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_KEY);
    req.user = decoded;
    console.log(`🔐 Authenticated user for upload:`, decoded.id);
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
};

// ------------------ Multer + Cloudinary Storage ------------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    resource_type: 'image',
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
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ------------------ Routes ------------------

// ✅ Single image upload
router.post('/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    console.log(`📸 Image uploaded successfully: ${req.file.filename}`);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: req.file.path,
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
      url: file.path,
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

    // filename from Cloudinary is in format "folder/public_id"
    const publicId = `uploads/${filename}`;
    await cloudinary.uploader.destroy(publicId);

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

  if (error.message?.includes('Invalid file type')) {
    return res.status(400).json({ success: false, error: error.message });
  }

  res.status(500).json({ success: false, error: 'Upload failed' });
});

export default router;