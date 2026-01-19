const express = require("express");
const Video = require("../models/Video");
const authOptional = require("../middleware/authOptional");

const router = express.Router();

/* =========================
   🤖 WATCH PAGE SUGGESTIONS
========================= */
router.get("/watch/:id", authOptional, async (req, res) => {
  try {
    const current = await Video.findById(req.params.id);
    if (!current) return res.json([]);

    let related;

    // 🎵 SONG LOGIC
    if (current.category === "songs" && current.subCategory) {
      related = await Video.find({
        _id: { $ne: current._id },
        published: true,
        category: "songs",
        subCategory: current.subCategory,
      }).limit(10);
    } else {
      related = await Video.find({
        _id: { $ne: current._id },
        published: true,
        category: current.category,
      }).limit(10);
    }

    // 🌍 Diversity
    const random = await Video.aggregate([
      { $match: { published: true } },
      { $sample: { size: 5 } },
    ]);

    res.json([...related, ...random]);
  } catch (err) {
    console.error("WATCH AI ERROR:", err);
    res.json([]);
  }
});

module.exports = router;
