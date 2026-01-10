const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const UserHistory = require("../models/UserHistory");

/* =========================
   SAVE WATCH HISTORY
========================= */
router.post("/watch", auth, async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ message: "Video ID required" });
    }

    // Prevent duplicate same-day entry
    const today = new Date().toISOString().slice(0, 10);

    const exists = await UserHistory.findOne({
      user: req.user.id,
      video: videoId,
      createdAt: {
        $gte: new Date(today),
      },
    });

    if (!exists) {
      await UserHistory.create({
        user: req.user.id,
        video: videoId,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("WATCH HISTORY ERROR:", err);
    res.status(500).json({ message: "Failed to save history" });
  }
});

/* =========================
   GET WATCH HISTORY
========================= */
router.get("/history", auth, async (req, res) => {
  try {
    const history = await UserHistory.find({ user: req.user.id })
      .populate("video")
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to load history" });
  }
});

module.exports = router;
