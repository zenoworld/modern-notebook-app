import express from 'express';
import Note from '../models/Note';
import { CustomError } from '../middleware/errorHandler';

const router = express.Router();

// Get all notes (optionally filtered by folderId)
router.get('/', async (req, res, next) => {
  try {
    const { folderId } = req.query;
    const query = folderId ? { folderId } : {};
    
    const notes = await Note.find(query)
      .populate('folderId', 'name')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
});

// Get a single note by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const note = await Note.findById(id).populate('folderId', 'name');
    
    if (!note) {
      const error = new Error('Note not found') as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
});

// Create a new note
router.post('/', async (req, res, next) => {
  try {
    const { folderId, title, content, url, imageUrl } = req.body;

    if (!folderId || !title || !content) {
      const error = new Error('Folder ID, title, and content are required') as CustomError;
      error.statusCode = 400;
      throw error;
    }

    const note = new Note({
      folderId,
      title: title.trim(),
      content: content.trim(),
      url: url?.trim() || undefined,
      imageUrl: imageUrl?.trim() || undefined,
    });

    await note.save();
    await note.populate('folderId', 'name');

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
});

// Update a note
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, url, imageUrl } = req.body;

    if (!title || !content) {
      const error = new Error('Title and content are required') as CustomError;
      error.statusCode = 400;
      throw error;
    }

    const note = await Note.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        content: content.trim(),
        url: url?.trim() || undefined,
        imageUrl: imageUrl?.trim() || undefined,
      },
      { new: true, runValidators: true }
    ).populate('folderId', 'name');

    if (!note) {
      const error = new Error('Note not found') as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
});

// Delete a note
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await Note.findByIdAndDelete(id);

    if (!note) {
      const error = new Error('Note not found') as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
