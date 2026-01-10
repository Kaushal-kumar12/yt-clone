const express = require("express");
const router = express.Router();
const Playlist = require("../models/Playlist");
const authMiddleware = require("../middleware/authMiddleware");

/* =========================
   GET USER PLAYLISTS
========================= */
router.get("/", authMiddleware, async (req, res) => {
  const playlists = await Playlist.find({ user: req.user.id });
  res.json(playlists);
});

/* =========================
   CREATE PLAYLIST
========================= */
router.post("/", authMiddleware, async (req, res) => {
  const playlist = new Playlist({
    name: req.body.name,
    user: req.user.id,
    videos: req.body.videoId ? [req.body.videoId] : [],
  });

  await playlist.save();
  res.json(playlist);
});

/* =========================
   ADD VIDEO TO PLAYLIST
========================= */
router.post("/:id/add", authMiddleware, async (req, res) => {
  const playlist = await Playlist.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }

  if (!playlist.videos.includes(req.body.videoId)) {
    playlist.videos.push(req.body.videoId);
    await playlist.save();
  }

  res.json({ message: "Video added" });
});

/* =========================
   REMOVE VIDEO FROM PLAYLIST ✅
========================= */
router.post("/:id/remove", authMiddleware, async (req, res) => {
  const playlist = await Playlist.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }

  playlist.videos = playlist.videos.filter(
    (v) => v.toString() !== req.body.videoId
  );

  await playlist.save();
  res.json({ message: "Video removed" });
});

/* =========================
   GET SINGLE PLAYLIST
========================= */
router.get("/:id", authMiddleware, async (req, res) => {
  const playlist = await Playlist.findOne({
    _id: req.params.id,
    user: req.user.id, // 🔒 user-separated
  }).populate("videos");

  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }

  res.json(playlist);
});


module.exports = router;
