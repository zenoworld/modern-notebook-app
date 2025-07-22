import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  folderId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  url?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema(
  {
    folderId: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
      required: [true, 'Folder ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
    },
    url: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true;
          return /^https?:\/\/.+\..+/.test(v);
        },
        message: 'Please enter a valid URL',
      },
    },
    imageUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
NoteSchema.index({ folderId: 1 });
NoteSchema.index({ title: 1 });

export default mongoose.model<INote>('Note', NoteSchema);
