import mongoose, { Document, Model, Schema } from "mongoose";

export enum UserRole {
  ADMIN = "ADMIN",
  PREMIUM_USER = "PREMIUM_USER", // Mediator
  USER = "USER",                 // Buyer
}

export interface IUser extends Document {
  name: string;
  email: string;
  mobile: string;
  password?: string;
  role: UserRole;
  mediatorCode?: string; // e.g. LAX096 for Premium Users
  paymentDetails?: {
    upiId?: string;
    bankName?: string;
    accountHolder?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  isActive: boolean;
  totalCompletedOrders: number;
  resetPasswordOTP?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    password: { type: String },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      required: true,
    },
    mediatorCode: { type: String, sparse: true, uppercase: true, trim: true },
    paymentDetails: {
      upiId: { type: String, trim: true },
      bankName: { type: String, trim: true },
      accountHolder: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
    },
    isActive: { type: Boolean, default: true },
    totalCompletedOrders: { type: Number, default: 0 },
    resetPasswordOTP: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ mobile: 1 });
UserSchema.index({ role: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
