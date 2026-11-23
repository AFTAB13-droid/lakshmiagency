import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOtpLog extends Document {
  email: string;
  purpose: "REGISTRATION" | "FORGOT_PASSWORD";
  otp: string;
  attempts: number; // 1, 2, 3
  lastSentAt: Date;
  nextResendAfter: number; // Seconds to wait: 30 for 1st resend, 65 for 2nd
  lockedUntil?: Date; // Set when 3 attempts reached (1 hour lockout)
  expiresAt: Date;
  registrationData?: {
    name: string;
    mobile: string;
    password: string; // Pre-hashed
    role: string;
    mediatorCode?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OtpLogSchema = new Schema<IOtpLog>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    purpose: { type: String, enum: ["REGISTRATION", "FORGOT_PASSWORD"], required: true },
    otp: { type: String, required: true },
    attempts: { type: Number, default: 1 },
    lastSentAt: { type: Date, default: Date.now },
    nextResendAfter: { type: Number, default: 30 }, // 30 sec after 1st send
    lockedUntil: { type: Date },
    expiresAt: { type: Date, required: true },
    registrationData: {
      name: String,
      mobile: String,
      password: String,
      role: String,
      mediatorCode: String,
    },
  },
  { timestamps: true }
);

OtpLogSchema.index({ email: 1, purpose: 1 });
OtpLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpLog: Model<IOtpLog> =
  mongoose.models.OtpLog || mongoose.model<IOtpLog>("OtpLog", OtpLogSchema);
