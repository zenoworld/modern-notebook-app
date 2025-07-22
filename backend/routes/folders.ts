import express from 'express';
import Folder from '../models/Folder';
import Note from '../models/Note';
import { CustomError } from '../middleware/errorHandler';

const router = express.Router();

// Get all folders
router.get('/', async (req, res, next) => {
  try {
    const folders = await Folder.find().sort({ updatedAt: -1 });
    res.json({
      success: true,
      data: folders,
    });
  } catch (error) {
    next(error);
  }
});

// Create a new folder
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      const error = new Error('Folder name is required') as CustomError;
      error.statusCode = 400;
      throw error;
    }

    const folder = new Folder({ name: name.trim() });
    await folder.save();

    res.status(201).json({
      success: true,
      data: folder,
    });
  } catch (error) {
    if ((error as any).code === 11000) {
      const customError = new Error('Folder name already exists') as CustomError;
      customError.statusCode = 400;
      next(customError);
    } else {
      next(error);
    }
  }
});

// Update folder name
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      const error = new Error('Folder name is required') as CustomError;
      error.statusCode = 400;
      throw error;
    }

    const folder = await Folder.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!folder) {
      const error = new Error('Folder not found') as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: folder,
    });
  } catch (error) {
    if ((error as any).code === 11000) {
      const customError = new Error('Folder name already exists') as CustomError;
      customError.statusCode = 400;
      next(customError);
    } else {
      next(error);
    }
  }
});

// Delete folder and its notes
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const folder = await Folder.findById(id);
    if (!folder) {
      const error = new Error('Folder not found') as CustomError;
      error.statusCode = 404;
      throw error;
    }

    // Delete all notes in the folder
    await Note.deleteMany({ folderId: id });
    
    // Delete the folder
    await Folder.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Folder and its notes deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
