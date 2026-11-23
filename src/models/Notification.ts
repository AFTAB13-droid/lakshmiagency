import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId; // User ID
  recipientRole: "ADMIN" | "PREMIUM_USER" | "USER";
  title: string;
  message: string;
  type: "ORDER_CREATED" | "REFUND_SUBMITTED" | "PAYMENT_COMPLETED" | "SYSTEM_ALERT";
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipientRole: { type: String, enum: ["ADMIN", "PREMIUM_USER", "USER"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["ORDER_CREATED", "REFUND_SUBMITTED", "PAYMENT_COMPLETED", "SYSTEM_ALERT"],
      default: "SYSTEM_ALERT",
    },
    link: { type: String, default: "" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
