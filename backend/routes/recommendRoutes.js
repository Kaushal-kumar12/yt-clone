const express = require("express");
const Video = require("../models/Video");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/* ===============================
   WATCH PAGE RECOMMENDATION
================================ */

router.get("/watch/:id", auth, async (req, res) => {
  try {
    const currentVideo = await Video.findById(req.params.id);

    if (!currentVideo) {
      return res.status(404).json([]);
    }

    // 80% related
    const related = await Video.find({
      category: currentVideo.category,
      _id: { $ne: currentVideo._id },
    }).limit(8);

    // 20% mixed
    const mixed = await Video.aggregate([
      { $match: { category: { $ne: currentVideo.category } } },
      { $sample: { size: 4 } },
    ]);

    res.json([...related, ...mixed]);
  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json([]);
  }
});

module.exports = router;
