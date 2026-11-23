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

  // Pricing Model
  pricingType: DealPricingType;
  lessAmount: number;         // Active when pricingType == "LESS"
  commissionAmount: number;   // Active when pricingType == "COMMISSION"

  // Granular Slot Allocations (inspired by ZMA & AspireMint)
  totalSlots: number;
  remainingSlots: number;

  reviewSlots: number;
  remainingReview: number;

  ratingSlots: number;
  remainingRating: number;

  feedbackSlots: number;
  remainingFeedback: number;

  dealType: "Original" | "Empty Box" | "Exchange";
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

    // Pricing Model
    pricingType: {
      type: String,
      enum: ["LESS", "FULL_REFUND", "COMMISSION"],
      default: "FULL_REFUND",
    },
    lessAmount: { type: Number, default: 0 },
    commissionAmount: { type: Number, default: 0 },

    // Granular Slots
    totalSlots: { type: Number, required: true, default: 0 },
    remainingSlots: { type: Number, required: true, default: 0 },

    reviewSlots: { type: Number, default: 0 },
    remainingReview: { type: Number, default: 0 },

    ratingSlots: { type: Number, default: 0 },
    remainingRating: { type: Number, default: 0 },

    feedbackSlots: { type: Number, default: 0 },
    remainingFeedback: { type: Number, default: 0 },

    dealType: { type: String, enum: ["Original", "Empty Box", "Exchange"], default: "Original" },
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
