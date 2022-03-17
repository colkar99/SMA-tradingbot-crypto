const mongoose = require("mongoose");

const LogSchema = mongoose.Schema(
  {
    heading: { type: String },
    description: { type: String },
    ticker: { type: String },
    log: { type: String },
    //
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", LogSchema); // Table Name, Schema Name
