import mongoose, { Document, Model, Schema } from "mongoose";

export type DealPricingType = "LESS" | "FULL_REFUND" | "COMMISSION";

export interface IDeal extends Document {
  brandName: string;
  brandId?: mongoose.Types.ObjectId;
  productName: string;
  productCode: string;
  marketplace: string; // e.g. Amazon, Flipkart, Myntra
  marketplaceId?: mongoose.Types.ObjectId;
  productLink?: string;
  productImage?: string; // Cloudinary URL
  price: number;

  // Pricing Model (Legacy / Primary Fallback)
  pricingType: DealPricingType;
  lessAmount: number;         // Active when pricingType == "LESS"
  commissionAmount: number;   // Active when pricingType == "COMMISSION"

  // Per-Feedback-Type Pricing (Review vs Rating)
  reviewPricingType?: DealPricingType;
  reviewLessAmount?: number;
  reviewCommissionAmount?: number;

  ratingPricingType?: DealPricingType;
  ratingLessAmount?: number;
  ratingCommissionAmount?: number;

  // Review Delete / Error Pricing Policy
  reviewDeletePricingType?: "NONE" | DealPricingType;
  reviewDeleteLessAmount?: number;
  reviewDeleteCommissionAmount?: number;

  // Granular Slot Allocations (inspired by ZMA & AspireMint)
  totalSlots: number;
  remainingSlots: number;

  reviewSlots: number;
  remainingReview: number;

  ratingSlots: number;
  remainingRating: number;

  feedbackSlots: number;
  remainingFeedback: number;

  dealType: "Original" | "Empty Box" | "Exchange" | "No Investment";
  description?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  assignedMediators?: mongoose.Types.ObjectId[];
  isActive: boolean;
  userRemarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DealSchema = new Schema<IDeal>(
  {
    brandName: { type: String, required: true, trim: true },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand" },
    productName: { type: String, required: true, trim: true },
    productCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    marketplace: { type: String, required: true, default: "Amazon" },
    marketplaceId: { type: Schema.Types.ObjectId, ref: "Marketplace" },
    productLink: { type: String, default: "" },
    productImage: { type: String, default: "" },
    price: { type: Number, required: true },

    // Pricing Model (Legacy / Primary Fallback)
    pricingType: {
      type: String,
      enum: ["LESS", "FULL_REFUND", "COMMISSION"],
      default: "FULL_REFUND",
    },
    lessAmount: { type: Number, default: 0 },
    commissionAmount: { type: Number, default: 0 },

    // Per-Feedback-Type Pricing (Review vs Rating)
    reviewPricingType: {
      type: String,
      enum: ["LESS", "FULL_REFUND", "COMMISSION"],
      default: "FULL_REFUND",
    },
    reviewLessAmount: { type: Number, default: 0 },
    reviewCommissionAmount: { type: Number, default: 0 },

    ratingPricingType: {
      type: String,
      enum: ["LESS", "FULL_REFUND", "COMMISSION"],
      default: "FULL_REFUND",
    },
    ratingLessAmount: { type: Number, default: 0 },
    ratingCommissionAmount: { type: Number, default: 0 },

    // Review Delete / Error Pricing Policy
    reviewDeletePricingType: {
      type: String,
      enum: ["NONE", "LESS", "FULL_REFUND", "COMMISSION"],
      default: "NONE",
    },
    reviewDeleteLessAmount: { type: Number, default: 0 },
    reviewDeleteCommissionAmount: { type: Number, default: 0 },

    // Granular Slots
    totalSlots: { type: Number, required: true, default: 0 },
    remainingSlots: { type: Number, required: true, default: 0 },

    reviewSlots: { type: Number, default: 0 },
    remainingReview: { type: Number, default: 0 },

    ratingSlots: { type: Number, default: 0 },
    remainingRating: { type: Number, default: 0 },

    feedbackSlots: { type: Number, default: 0 },
    remainingFeedback: { type: Number, default: 0 },

    dealType: { type: String, enum: ["Original", "Empty Box", "Exchange", "No Investment"], default: "Original" },
    description: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    whatsappMessage: { type: String, default: "Hey, I want to take the No Investment Deal. Please share details!" },
    assignedMediators: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
    userRemarks: { type: String, default: "" },
  },
  { timestamps: true }
);

DealSchema.index({ isActive: 1, remainingSlots: 1 });
DealSchema.index({ isActive: 1, createdAt: -1 });
DealSchema.index({ marketplace: 1, isActive: 1 });

export const Deal: Model<IDeal> =
  mongoose.models.Deal || mongoose.model<IDeal>("Deal", DealSchema);
