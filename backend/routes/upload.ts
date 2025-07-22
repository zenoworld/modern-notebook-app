import express from 'express';
import multer from 'multer';
import { uploadToCloudinary } from '../utils/cloudinary';
import { CustomError } from '../middleware/errorHandler';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any, false);
    }
  },
});

// Upload image endpoint
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('No file uploaded') as CustomError;
      error.statusCode = 400;
      throw error;
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      
      // For development without Cloudinary, return a mock URL
      const mockUrl = `https://via.placeholder.com/400x300/000000/FFFFFF?text=Image+${Date.now()}`;
      
      res.json({
        success: true,
        data: {
          url: mockUrl,
          message: 'Using mock URL - configure Cloudinary for real uploads',
        },
      });
      return;
    }

    const imageUrl = await uploadToCloudinary(req.file);
    
    res.json({
      success: true,
      data: {
        url: imageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
