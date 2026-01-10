const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
  },
  {
    timestamps: true, // ✅ THIS FIXES INVALID DATE
  }
);

module.exports = mongoose.model("Like", likeSchema);
