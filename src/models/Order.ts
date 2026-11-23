import mongoose, { Document, Model, Schema } from "mongoose";

export enum OrderStatus {
  ORDER_FILLED = "ORDER_FILLED",             // Step 2: Google Order Form submitted
  HOLDING_PERIOD = "HOLDING_PERIOD",         // Step 3 & 4: Waiting for delivery & review window
  REFUND_FORM_FILLED = "REFUND_FORM_FILLED", // Step 5: Google Refund Form submitted
  APPROVED_AND_PAID = "APPROVED_AND_PAID",   // Step 7: Disbursed within 20-25 working days
  REJECTED = "REJECTED",                     // Rejected (slots auto-restored +1)
  CANCELLED = "CANCELLED",                   // Cancelled by buyer/mediator
}

export interface IOrder extends Document {
  marketplaceOrderId: string; // e.g. Amazon 405-6846559-6354704
  dealId?: mongoose.Types.ObjectId;
  productCode: string;
  productName: string;
  brandName: string;
  marketplace: string;
  amount: number;
  payoutAmount: number; // Amount to be refunded

  // Buyer Info from Google Order Form
  buyer?: mongoose.Types.ObjectId; // Linked registered User account
  buyerName: string;
  buyerEmail?: string;
  buyerPhone: string;
  orderScreenshotUrl?: string;

  // Refund Form Submissions
  reviewScreenshotUrl?: string; // Review proof submitted in Google Refund Form
  upiId?: string;              // UPI ID submitted in Google Refund Form

  // Assignment
  mediator?: mongoose.Types.ObjectId; // Assigned Premium User
  mediatorCode?: string;             // e.g. LAX096

  // Status & Lifecycle Dates
  status: OrderStatus;
  orderDate?: Date;
  deliveryDate?: Date;
  reviewDate?: Date;

  // 20-Day Rule Tracking
  refundFormDeadline?: Date;         // 20 days from delivery
  refundFormSubmittedAt?: Date;

  // Step 7: 20-25 Working Days Payout Tracking
  expectedPayoutDate?: Date;         // Excludes weekends & holidays
  paidAt?: Date;
  paymentScreenshotUrl?: string;     // Cloudinary URL
  transactionReference?: string;     // Bank UTR or UPI Ref

  rejectionReason?: string;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    marketplaceOrderId: { type: String, required: true, unique: true, trim: true },
    dealId: { type: Schema.Types.ObjectId, ref: "Deal" },
    productCode: { type: String, default: "GENERAL", uppercase: true, trim: true },
    productName: { type: String, default: "" },
    brandName: { type: String, default: "" },
    marketplace: { type: String, default: "Amazon" },
    amount: { type: Number, default: 0 },
    payoutAmount: { type: Number, default: 0 },

    buyer: { type: Schema.Types.ObjectId, ref: "User" },
    buyerName: { type: String, default: "Valued Buyer", trim: true },
    buyerEmail: { type: String, trim: true, lowercase: true },
    buyerPhone: { type: String, default: "N/A", trim: true },
    orderScreenshotUrl: { type: String, default: "" },
    reviewScreenshotUrl: { type: String, default: "" },
    upiId: { type: String, default: "" },

    mediator: { type: Schema.Types.ObjectId, ref: "User" },
    mediatorCode: { type: String, uppercase: true, trim: true },

    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.ORDER_FILLED,
    },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
    reviewDate: { type: Date },

    refundFormDeadline: { type: Date },
    refundFormSubmittedAt: { type: Date },

    expectedPayoutDate: { type: Date },
    paidAt: { type: Date },
    paymentScreenshotUrl: { type: String, default: "" },
    transactionReference: { type: String, default: "" },

    rejectionReason: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

OrderSchema.index({ mediator: 1, status: 1 });
OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ buyerEmail: 1, createdAt: -1 });
OrderSchema.index({ buyerPhone: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
