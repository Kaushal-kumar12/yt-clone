const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const User = require("../models/User");
const UserHistory = require("../models/UserHistory");
const Playlist = require("../models/Playlist");
const Like = require("../models/Like");

/* =========================
   GET ALL USERS (ADMIN)
========================= */
router.get("/users", auth, admin, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

/* =========================
   BLOCK / UNBLOCK USER
========================= */
router.put("/block/:id", auth, admin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.role === "admin") {
    return res.status(400).json({ message: "Cannot block admin" });
  }

  user.blocked = !user.blocked;
  await user.save();

  res.json(user);
});

/* =========================
   CHANGE USER ROLE
========================= */
router.put("/role/:id", auth, admin, async (req, res) => {
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select("-password");

  res.json(user);
});

/* =========================
   USER ACTIVITY (ADMIN)
========================= */
router.get("/user/:id/activity", auth, admin, async (req, res) => {
  const userId = req.params.id;

  /* WATCH HISTORY — GROUP BY DATE */
  const historyRaw = await UserHistory.find({ user: userId })
    .populate("video")
    .sort({ createdAt: -1 });

  const history = {};

  historyRaw.forEach((h) => {
    const date = h.createdAt.toISOString().split("T")[0];
    if (!history[date]) history[date] = [];
    history[date].push(h.video);
  });

  const historyGrouped = Object.keys(history).map((date) => ({
    _id: date,
    videos: history[date],
  }));

  /* LIKED VIDEOS */
  const likes = await Like.find({ user: userId }).populate("video");

  /* PLAYLISTS */
  const playlists = await Playlist.find({ user: userId }).populate("videos");

  res.json({
    history: historyGrouped,
    likes,
    playlists,
  });
});

module.exports = router;
