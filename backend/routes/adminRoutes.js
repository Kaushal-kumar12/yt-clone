const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const UserHistory = require("../models/UserHistory");
const Like = require("../models/Like");
const Playlist = require("../models/Playlist");

/* =========================
   SAVE WATCH HISTORY
========================= */
router.post("/watch", auth, async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ message: "Video ID required" });
    }

    // 🔥 Start & end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 🔒 Prevent duplicate SAME-DAY entry
    const exists = await UserHistory.findOne({
      user: req.user.id,
      video: videoId,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
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
    res.status(500).json({ message: "Failed to save watch history" });
  }
});

/* =========================
   USER WATCH HISTORY (RAW)
========================= */
router.get("/history", auth, async (req, res) => {
  try {
    const history = await UserHistory.find({ user: req.user.id })
      .populate({
        path: "video",
        match: { published: true },
      })
      .sort({ createdAt: -1 });

    // 🔥 REMOVE BROKEN REFERENCES
    const cleanHistory = history.filter(h => h.video);

    res.json(cleanHistory);
  } catch (err) {
    res.status(500).json({ message: "Failed to load history" });
  }
});


/* ======================================================
   🔥 ADMIN: FULL USER ACTIVITY (YOUTUBE-LIKE)
====================================================== */
router.get("/user/:id/activity", auth, admin, async (req, res) => {
  const userId = req.params.id;

  try {
    /* =========================
       WATCH HISTORY (GROUPED)
    ========================= */
    const history = await UserHistory.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      },

      // Convert createdAt → date string
      {
        $addFields: {
          watchDate: {
            $dateToString: {
              format: "%d %b %Y",
              date: "$createdAt",
            },
          },
        },
      },

      // One video per day
      {
        $group: {
          _id: {
            date: "$watchDate",
            video: "$video",
          },
          lastWatchedAt: { $max: "$createdAt" },
        },
      },

      // Sort latest first
      {
        $sort: { lastWatchedAt: -1 },
      },

      // Join video data
      {
        $lookup: {
          from: "videos",
          localField: "_id.video",
          foreignField: "_id",
          as: "video",
        },
      },

      { $unwind: "$video" },

      // Group by date
      {
        $group: {
          _id: "$_id.date",
          videos: { $push: "$video" },
        },
      },

      // Sort dates
      {
        $sort: { _id: -1 },
      },
    ]);

    /* =========================
       LIKED VIDEOS
    ========================= */
    const likes = await Like.find({ user: userId }).populate("video");

    /* =========================
       PLAYLISTS + VIDEOS
    ========================= */
    const playlists = await Playlist.find({ user: userId }).populate("videos");

    res.json({
      history,   // grouped by date
      likes,
      playlists,
    });
  } catch (err) {
    console.error("ADMIN ACTIVITY ERROR:", err);
    res.status(500).json({ message: "Failed to load user activity" });
  }
});

module.exports = router;
