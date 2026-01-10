const express = require("express");
const Channel = require("../models/Channel");
const Video = require("../models/Video");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

/* =========================
   CREATE CHANNEL
========================= */
router.post("/", auth, admin, async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ message: "Channel name required" });
    }

    const channel = await Channel.create({ name: req.body.name });
    res.json(channel);
  } catch (err) {
    res.status(500).json({ message: "Failed to create channel" });
  }
});

/* =========================
   GET ALL CHANNELS
========================= */
router.get("/", auth, admin, async (req, res) => {
  try {
    const channels = await Channel.find().sort({ createdAt: -1 });
    res.json(channels);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch channels" });
  }
});

/* =========================
   RENAME CHANNEL
========================= */
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const channel = await Channel.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    res.json(channel);
  } catch (err) {
    res.status(500).json({ message: "Failed to rename channel" });
  }
});

/* =========================
   DELETE CHANNEL
   ?force=true → delete channel + videos
========================= */
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const channelId = req.params.id;
    const force = req.query.force === "true";

    const videosCount = await Video.countDocuments({ channel: channelId });

    if (videosCount > 0 && !force) {
      return res.status(400).json({
        requireConfirm: true,
        message: "Channel contains videos",
        count: videosCount,
      });
    }

    await Video.deleteMany({ channel: channelId });
    await Channel.findByIdAndDelete(channelId);

    res.json({ message: "Channel deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete channel" });
  }
});

module.exports = router;
