const express = require("express");
const auth = require("../middleware/authMiddleware");
const UserHistory = require("../models/UserHistory");
const Video = require("../models/Video");

const router = express.Router();

/* =========================
   SAVE WATCH HISTORY (AI)
========================= */
router.post("/watch", auth, async (req, res) => {
  try {
    const { videoId } = req.body;

    const video = await Video.findById(videoId);
    if (!video) return res.json({ success: true });

    // prevent duplicate same-day watch
    const today = new Date().toISOString().slice(0, 10);

    const exists = await UserHistory.findOne({
      user: req.user.id,
      video: videoId,
      createdAt: { $gte: new Date(today) },
    });

    if (!exists) {
      await UserHistory.create({
        user: req.user.id,
        video: video._id,
        category: video.category,
        subCategory: video.subCategory || null,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("WATCH HISTORY ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/* =========================
   GET WATCH HISTORY
========================= */
router.get("/history", auth, async (req, res) => {
  try {
    const history = await UserHistory.find({
      user: req.user.id,
    })
      .populate("video")           // 🔥 REQUIRED for frontend
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    console.error("HISTORY FETCH ERROR:", err);
    res.status(500).json([]);
  }
});


module.exports = router;
