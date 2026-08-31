import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaint extends Document {
  complaintId?: string;
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  issueCategory: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    area?: string;
  };
  images: string[];
  voiceTranscript?: string;
  aiAnalysis: {
    issueCategory: string;
    confidence: number;
    severity: string;
    description: string;
    suggestedTitle: string;
    detectedObjects?: string[];
  };
  assignedOrganization?: string;
  organizationReferenceId?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

const LocationSchema = new Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String },
  city: { type: String },
  area: { type: String },
}, { _id: false });

const AIAnalysisSchema = new Schema({
  issueCategory: { type: String, required: true },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  severity: { type: String, required: true },
  description: { type: String, required: true },
  suggestedTitle: { type: String, required: true },
  detectedObjects: [{ type: String }],
}, { _id: false });

const ComplaintSchema = new Schema<IComplaint>({
  complaintId: { type: String, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  issueCategory: { type: String, required: true, index: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'rejected'],
    default: 'pending',
    index: true,
  },
  location: { type: LocationSchema, required: true },
  images: [{ type: String }],
  voiceTranscript: { type: String },
  aiAnalysis: { type: AIAnalysisSchema, required: true },
  assignedOrganization: { type: String },
  organizationReferenceId: { type: String },
  adminNotes: { type: String },
  resolvedAt: { type: Date },
}, {
  timestamps: true,
});

// Indexes for common queries
ComplaintSchema.index({ userId: 1, createdAt: -1 });
ComplaintSchema.index({ status: 1, createdAt: -1 });
ComplaintSchema.index({ issueCategory: 1, status: 1 });
ComplaintSchema.index({ 'location.city': 1, status: 1 });

export const Complaint = (mongoose.models.Complaint as mongoose.Model<IComplaint>) || mongoose.model<IComplaint>('Complaint', ComplaintSchema);