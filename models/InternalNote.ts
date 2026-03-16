import mongoose, { Schema, Document, Model } from 'mongoose';

export type NoteEntityType = 'client' | 'case' | 'partner' | 'employee';

export interface IInternalNote extends Document {
  entityType: NoteEntityType;
  entityId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InternalNoteSchema: Schema = new Schema(
  {
    entityType: { type: String, enum: ['client', 'case', 'partner', 'employee'], required: true },
    entityId:   { type: Schema.Types.ObjectId, required: true },
    authorId:   { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    content:    { type: String, required: true, maxlength: 4000 },
    isPinned:   { type: Boolean, default: false },
  },
  { timestamps: true },
);

InternalNoteSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export const InternalNote: Model<IInternalNote> =
  mongoose.models.InternalNote ||
  mongoose.model<IInternalNote>('InternalNote', InternalNoteSchema);
