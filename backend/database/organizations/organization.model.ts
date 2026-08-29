import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  nameUrdu?: string;
  email: string;
  phone?: string;
  categories: string[];
  city: string;
  area?: string;
  isActive: boolean;
  apiEndpoint?: string;
  apiKey?: string;
  contactPerson?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true, maxlength: 200 },
  nameUrdu: { type: String, maxlength: 200 },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  categories: [{ type: String, required: true }],
  city: { type: String, required: true, lowercase: true, index: true },
  area: { type: String },
  isActive: { type: Boolean, default: true, index: true },
  apiEndpoint: { type: String },
  apiKey: { type: String, select: false },
  contactPerson: { type: String },
  address: { type: String },
}, {
  timestamps: true,
});

// Indexes
OrganizationSchema.index({ city: 1, categories: 1 });
OrganizationSchema.index({ isActive: 1, city: 1 });

export const Organization = (mongoose.models.Organization as mongoose.Model<IOrganization>) || mongoose.model<IOrganization>('Organization', OrganizationSchema);