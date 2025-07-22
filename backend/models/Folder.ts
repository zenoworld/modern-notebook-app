import mongoose, { Document, Schema } from 'mongoose';

export interface IFolder extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      maxlength: [100, 'Folder name cannot exceed 100 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
FolderSchema.index({ name: 1 });

export default mongoose.model<IFolder>('Folder', FolderSchema);
