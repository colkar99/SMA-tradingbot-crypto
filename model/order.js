const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema(
  {
    pairName: { type: String, required: true },
    baseAsset: { type: String },
    quoteAsset: { type: String },
    timeFrameInMin: { type: String },
    entryOrderId: { type: String, required: true },
    entryOrderStatus: {
      type: String,
      enum: ["FILLED", "NOTFILLED", "INITIALIZE"],
      default: "INITIALIZE",
    },
    orderType: {
      type: String,
      enum: ["BUY", "SELL"],
      default: "BUY",
    },
    entryPrice: { type: Number, default: 0 },
    entryDate: { type: Date },
    exitDate: { type: Date },
    slOrderId: { type: String, required: true },
    quantity: { type: Number },
    cummulativeQuoteQty: { type: Number },
    slPrice: { type: Number },
    slTriggerPrice: { type: Number },
    slPercent: { type: Number },
    riskPerTrade: { type: Number },
    totalCapital: { type: Number },
    slOrderStatus: {
      type: String,
      enum: ["OPEN", "EXECUTED", "FILLED", "CANCELLED"],
      default: "OPEN",
    },
    positionSizeCurrency: { type: Number },
    positionSizeBTC: { type: Number },
    exitPrice: { type: Number },
    exitOrderId: { type: Number },
    exitOrderStatus: {
      type: String,
      enum: ["NOT_STARTED", "FILLED"],
      default: "NOT_STARTED",
    },
    exitQuantity: { type: Number },
    plPercent: { type: Number },
    plCurrency: { type: Number },
    feesInPercent: { type: Number, default: 0.15 },
    comments: { type: String },
    tradeCurrencyType: {
      type: String,
      enum: ["USDT", "BTC"],
      default: "USDT",
    },
    globalCurrency: { type: String, default: "$" },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    isErrorHappend: { type: Boolean, default: false },
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // firstName: { type: String, default: '' },
    // lastName: { type: String, default: '' },
    // gender: { type: String, enum: ['Male', 'Female', 'Others'], default: 'Male' },
    // dob: { type: Date, required: false, default: null },
    // mobileNumber: { type: String, default: '' },
    // isSameAswhatsAppNumber: { type: Boolean, default: false },
    // email: { type: String, default: '' },
    // whatsAppNumber: { type: String, default: '' },
    // alternativeNumber: { type: String, default: '' },
    // phoneCode: { type: String, default: '' },
    // licenseNumber: { type: String, default: '' },
    // practisingSince: { type: Date, default: null },
    // imageUrl: { type: String, default: '' },
    // isActive: { type: Boolean, default: true },
    // isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema); // Table Name, Schema Name
