import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, UserRole } from "../models/User";
import { Brand } from "../models/Brand";
import { Marketplace } from "../models/Marketplace";
import { Deal } from "../models/Deal";
import { Order, OrderStatus } from "../models/Order";
import { Setting } from "../models/Setting";

const MONGODB_URI = "mongodb+srv://lakshmiagencyapp_db_user:2RULi8IDz7UmCp3D@cluster0.tyxhjoc.mongodb.net/lakshmi_agency?retryWrites=true&w=majority";

async function seed() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully!");

  // Clear existing test collections
  await Promise.all([
    User.deleteMany({}),
    Brand.deleteMany({}),
    Marketplace.deleteMany({}),
    Deal.deleteMany({}),
    Order.deleteMany({}),
    Setting.deleteMany({}),
  ]);
  console.log("Cleared existing data.");

  // Hash passwords
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const mediatorPassword = await bcrypt.hash("LAX096", 10);
  const buyerPassword = await bcrypt.hash("Buyer@123", 10);

  // 1. Create Users
  const admin = await User.create({
    name: "Agency Administrator",
    email: "admin@lakshmiagency.in",
    password: adminPassword,
    role: UserRole.ADMIN,
    mobile: "9876543210",
    isActive: true,
  });

  const mediator = await User.create({
    name: "Laxmi",
    email: "anjalilakshmiadagency@gmail.comy",
    password: mediatorPassword,
    role: UserRole.PREMIUM_USER,
    mediatorCode: "LAX096",
    mobile: "8608093086",
    paymentDetails: {
      upiId: "9445743058@upi",
      bankName: "State Bank of India",
      accountHolder: "Laxmi",
      accountNumber: "30129481920",
      ifscCode: "SBIN0001234",
    },
    isActive: true,
  });

  const buyer = await User.create({
    name: "Ramakant",
    email: "buyer@lakshmiagency.in",
    password: buyerPassword,
    role: UserRole.USER,
    mobile: "9123456789",
    paymentDetails: {
      upiId: "ramakant@oksbi",
    },
    isActive: true,
  });

  console.log("Created users:", {
    admin: admin.email,
    mediator: mediator.email,
    buyer: buyer.email,
  });

  // 2. Create Marketplaces
  const marketplaces = await Marketplace.create([
    { name: "Amazon", slug: "amazon", isActive: true },
    { name: "Flipkart", slug: "flipkart", isActive: true },
    { name: "Myntra", slug: "myntra", isActive: true },
    { name: "Shopsy", slug: "shopsy", isActive: true },
    { name: "Meesho", slug: "meesho", isActive: true },
  ]);

  // 3. Create Brands
  const brands = await Brand.create([
    { name: "Ayushka Organic", isActive: true },
    { name: "My Armor", isActive: true },
    { name: "Urban Chic", isActive: true },
  ]);

  // 4. Create Deals
  const deals = await Deal.create([
    {
      brandName: "Ayushka Organic",
      brandId: brands[0]._id,
      productName: "Organic Hing Powder 100g",
      productCode: "AYU-HING-100",
      marketplace: "Amazon",
      marketplaceId: marketplaces[0]._id,
      productLink: "https://amazon.in/dp/B0EXAMPLE1",
      productImage: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=60",
      price: 498,
      pricingType: "LESS",
      lessAmount: 20,
      commissionAmount: 25,
      totalSlots: 20,
      remainingSlots: 15,
      reviewSlots: 10,
      remainingReview: 5,
      ratingSlots: 10,
      remainingRating: 10,
      dealType: "Original",
      assignedMediators: [mediator._id],
      isActive: true,
    },
    {
      brandName: "Ayushka Organic",
      brandId: brands[0]._id,
      productName: "Organic Turmeric Powder 250g",
      productCode: "AYU-TURM-250",
      marketplace: "Amazon",
      marketplaceId: marketplaces[0]._id,
      productLink: "https://amazon.in/dp/B0EXAMPLE2",
      productImage: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=60",
      price: 389,
      pricingType: "LESS",
      lessAmount: 25,
      commissionAmount: 25,
      totalSlots: 20,
      remainingSlots: 19,
      reviewSlots: 10,
      remainingReview: 9,
      ratingSlots: 10,
      remainingRating: 10,
      dealType: "Original",
      assignedMediators: [mediator._id],
      isActive: true,
    },
    {
      brandName: "My Armor",
      brandId: brands[1]._id,
      productName: "Baby Safety Gate for Kids & Pets",
      productCode: "MYA-GATE-01",
      marketplace: "Amazon",
      marketplaceId: marketplaces[0]._id,
      productLink: "https://amazon.in/dp/B0EXAMPLE3",
      productImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=60",
      price: 2499,
      pricingType: "LESS",
      lessAmount: 400,
      commissionAmount: 50,
      totalSlots: 14,
      remainingSlots: 14,
      reviewSlots: 7,
      remainingReview: 7,
      ratingSlots: 7,
      remainingRating: 7,
      dealType: "Original",
      assignedMediators: [mediator._id],
      isActive: true,
    },
  ]);

  // 5. Create Sample Orders for Mediator & Buyer
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 20);

  await Order.create([
    {
      marketplaceOrderId: "405-6846559-6354704",
      dealId: deals[0]._id,
      productCode: deals[0].productCode,
      productName: deals[0].productName,
      brandName: deals[0].brandName,
      marketplace: "Amazon",
      amount: deals[0].price,
      payoutAmount: deals[0].price - deals[0].lessAmount,
      buyerName: "Ramakant",
      buyerEmail: "buyer@lakshmiagency.in",
      buyerPhone: "9123456789",
      mediator: mediator._id,
      mediatorCode: "LAX096",
      status: OrderStatus.ORDER_FILLED,
      orderDate: new Date(),
      refundFormDeadline: deadline,
    },
    {
      marketplaceOrderId: "407-2150191-5432346",
      dealId: deals[1]._id,
      productCode: deals[1].productCode,
      productName: deals[1].productName,
      brandName: deals[1].brandName,
      marketplace: "Amazon",
      amount: deals[1].price,
      payoutAmount: deals[1].price - deals[1].lessAmount,
      buyerName: "Vikrant",
      buyerEmail: "vikrant@example.com",
      buyerPhone: "9811223344",
      mediator: mediator._id,
      mediatorCode: "LAX096",
      status: OrderStatus.REFUND_FORM_FILLED,
      orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      refundFormSubmittedAt: new Date(),
      refundFormDeadline: deadline,
      notes: "Payout Details: UPI=vikrant@upi",
    },
  ]);

  // 6. Create Global Settings
  await Setting.create({
    key: "global_settings",
    orderFormUrl: "https://forms.gle/ydedLFJwcef59hPD7",
    refundFormUrl: "https://forms.gle/ssWFUKVpoxoKzKWc8",
  });

  console.log("Seeding completed successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
