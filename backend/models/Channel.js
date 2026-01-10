const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  createdBy: { type: String, default: "admin" }
}, { timestamps: true });

module.exports = mongoose.model("Channel", channelSchema);
