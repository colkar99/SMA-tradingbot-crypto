const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    phoneCode: { type: String },
    password: { type: String },
    apiKey: { type: String },
    apiSecret: { type: String },
    subscriptionStatus: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
    slPercent: { type: Number, default: 1 },
    slLimitPercent: { type: Number, default: 0.2 },
    subscribeTimeFrame: { type: Number, default: 2 },
    //
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema); // Table Name, Schema Name
