import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash?: string; // For future password auth
  language: 'en' | 'ur';
  role: 'citizen' | 'admin' | 'organization';
  organizationId?: mongoose.Types.ObjectId;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  passwordHash: { type: String, select: false },
  language: { type: String, enum: ['en', 'ur'], default: 'en' },
  role: { type: String, enum: ['citizen', 'admin', 'organization'], default: 'citizen' },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
}, {
  timestamps: true,
});

// Indexes
UserSchema.index({ role: 1 });

export const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema);