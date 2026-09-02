import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'welcome' | 'complaint_status' | 'assignment' | 'resolved' | 'general';
  read: boolean;
  emailSent: boolean;
  pushSent: boolean;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['welcome', 'complaint_status', 'assignment', 'resolved', 'general'],
      required: true,
    },
    read: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    pushSent: { type: Boolean, default: false },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Notification =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
