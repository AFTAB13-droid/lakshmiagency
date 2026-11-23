import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMarketplace extends Document {
  name: string; // e.g. Amazon, Flipkart, Myntra, Shopsy, Meesho
  slug: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceSchema = new Schema<IMarketplace>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Marketplace: Model<IMarketplace> =
  mongoose.models.Marketplace || mongoose.model<IMarketplace>("Marketplace", MarketplaceSchema);
