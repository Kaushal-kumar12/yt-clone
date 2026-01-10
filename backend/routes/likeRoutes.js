const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Like = require("../models/Like");

/* TOGGLE LIKE */
router.post("/", auth, async (req, res) => {
  const { videoId } = req.body;

  const existing = await Like.findOne({
    user: req.user.id,
    video: videoId,
  });

  if (existing) {
    await Like.deleteOne({ _id: existing._id });
    return res.json({ liked: false });
  }

  await Like.create({
    user: req.user.id,
    video: videoId,
  });

  res.json({ liked: true });
});

/* GET USER LIKED VIDEOS */
router.get("/", auth, async (req, res) => {
  const likes = await Like.find({ user: req.user.id })
    .populate("video")
    .sort({ createdAt: -1 });

  res.json(likes);
});

module.exports = router;
