// models/UserHistory.js
const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true, // 🔥 REQUIRED for date-based history
  }
);

module.exports = mongoose.model("UserHistory", historySchema);
