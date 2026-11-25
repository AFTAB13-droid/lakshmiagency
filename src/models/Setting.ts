import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISetting extends Document {
  key: string;
  orderFormUrl: string;
  refundFormUrl: string;
  orderFormProductEntryId?: string;
  whatsappOrderTemplate: string;
  whatsappAnnouncementTemplate: string;
  returnWindowDays: number;
  payoutWorkingDays: number;
  updatedAt: Date;
}

const DEFAULT_ORDER_TEMPLATE = `🔥 NEW DEAL ALERT - {brandName} 🔥
Product: {productName}
Marketplace: {marketplace}
Price: ₹{price}
Your Less/Refund: ₹{lessAmount}
Commission: ₹{commission}
Available Slots: {remainingSlots}

👉 Click here to fill Order Form:
{orderFormUrl}

⚠️ Policy Notice:
1. Review within 4-5 days of delivery.
2. Refund form must be submitted within 20 days.
3. Refund takes 20-25 working days.
4. COD / Supercoins / Platform fees are not refundable.`;

const DEFAULT_ANNOUNCEMENT_TEMPLATE = `✨ LUXURY DEAL BROADCAST - {brandName} ✨
Product: {productName} ({marketplace})
Total Slots: {remainingSlots} Available!
Less / Discount: ₹{lessAmount}

👉 DM ME NOW FOR PRODUCT LINK & ORDER DETAILS! 👈`;

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, default: "global_settings", unique: true },
    orderFormUrl: { type: String, default: "https://forms.gle/ydedLFJwcef59hPD7" },
    refundFormUrl: { type: String, default: "https://forms.gle/ssWFUKVpoxoKzKWc8" },
    orderFormProductEntryId: { type: String, default: "" },
    whatsappOrderTemplate: { type: String, default: DEFAULT_ORDER_TEMPLATE },
    whatsappAnnouncementTemplate: { type: String, default: DEFAULT_ANNOUNCEMENT_TEMPLATE },
    returnWindowDays: { type: Number, default: 20 },
    payoutWorkingDays: { type: Number, default: 22 },
  },
  { timestamps: true }
);

export const Setting: Model<ISetting> =
  mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);
