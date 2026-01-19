const express = require("express");
const Video = require("../models/Video");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const Channel = require("../models/Channel");
const UserHistory = require("../models/UserHistory");
const authOptional = require("../middleware/authOptional");

const router = express.Router();

function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/aa/g, "a")     // shaadi → shadi
    .replace(/ee/g, "e")
    .replace(/oo/g, "o")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}


/* =========================
   YOUTUBE ID CLEANER
========================= */
function extractYouTubeId(input) {
  if (!input) return "";

  if (input.includes("youtube.com")) {
    try {
      return new URL(input).searchParams.get("v");
    } catch {
      return "";
    }
  }

  if (input.includes("youtu.be")) {
    return input.split("youtu.be/")[1].split("?")[0];
  }

  return input.split("&")[0];
}

/* =========================
   🔍 SEARCH (PUBLIC)  ✅ MUST BE BEFORE /:id
========================= */
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);

    const normalizedQ = normalize(q);

    // 🔍 Regex for partial matches
    const regex = new RegExp(normalizedQ.split(" ").join("|"), "i");

    /* ------------------------
       1️⃣ VIDEO MATCHING
    ------------------------- */
    let videos = await Video.find({
      published: true,
      $or: [
        { title: regex },
        { tags: regex },
        { category: regex }
      ]
    })
      .populate("channel", "name")
      .sort({ createdAt: -1 });

    /* ------------------------
       2️⃣ CHANNEL NAME MATCH
    ------------------------- */
    const channels = await Channel.find({
      name: regex
    });

    if (channels.length > 0) {
      const channelIds = channels.map(c => c._id);

      const channelVideos = await Video.find({
        channel: { $in: channelIds },
        published: true
      }).populate("channel", "name");

      // merge without duplicates
      const map = new Map();
      [...videos, ...channelVideos].forEach(v =>
        map.set(v._id.toString(), v)
      );

      videos = Array.from(map.values());
    }

    res.json(videos);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
});

/* =========================
   ADMIN ROUTES
========================= */

// ✅ ADD VIDEO
router.post("/", auth, admin, async (req, res) => {
  try {
    req.body.youtubeId = extractYouTubeId(req.body.youtubeId);

    if (!req.body.youtubeId) {
      return res.status(400).json({ message: "Invalid YouTube ID" });
    }

    const video = await Video.create(req.body);
    res.json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload video" });
  }
});

// ✅ UPDATE VIDEO (EDIT)
router.put("/:id", auth, admin, async (req, res) => {
  try {
    if (req.body.youtubeId) {
      req.body.youtubeId = extractYouTubeId(req.body.youtubeId);
    }

    const video = await Video.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(video);
  } catch (err) {
    res.status(500).json({ message: "Failed to update video" });
  }
});

// ✅ DELETE VIDEO
router.delete("/:id", auth, admin, async (req, res) => {
  await Video.findByIdAndDelete(req.params.id);
  res.json({ message: "Video deleted" });
});

// ✅ ADMIN – GET ALL VIDEOS
router.get("/admin/all", auth, admin, async (req, res) => {
  const videos = await Video.find()
    .populate("channel")
    .sort({ createdAt: -1 });

  res.json(videos);
});

// ✅ ADMIN – GET VIDEOS BY CHANNEL (CRITICAL)
router.get("/admin/channel/:channelId", auth, admin, async (req, res) => {
  const videos = await Video.find({ channel: req.params.channelId })
    .populate("channel")
    .sort({ createdAt: -1 });

  res.json(videos);
});

// ✅ TOGGLE PUBLISH STATUS
router.put("/:id/publish", auth, admin, async (req, res) => {
  const video = await Video.findById(req.params.id);
  video.published = !video.published;
  await video.save();
  res.json(video);
});

/* =========================
   PUBLIC ROUTES
========================= */

/* =========================
   🤖 AI HOME FEED
========================= */
router.get("/home", authOptional, async (req, res) => {
  try {
    // 👤 Guest → Trending
    if (!req.user) {
      const trending = await Video.find({ published: true })
        .sort({ views: -1 })
        .limit(20);
      return res.json(trending);
    }

    const history = await UserHistory.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);

    // No history → Trending
    if (!history.length) {
      const trending = await Video.find({ published: true })
        .sort({ views: -1 })
        .limit(20);
      return res.json(trending);
    }

    // 🔥 Build interest profile
    const categoryScore = {};
    const subCategoryScore = {};

    history.forEach(h => {
      if (h.category) {
        categoryScore[h.category] =
          (categoryScore[h.category] || 0) + 1;
      }

      if (h.subCategory) {
        subCategoryScore[h.subCategory] =
          (subCategoryScore[h.subCategory] || 0) + 1;
      }
    });

    const topCategory = Object.keys(categoryScore).sort(
      (a, b) => categoryScore[b] - categoryScore[a]
    )[0];

    const topSubCategory = Object.keys(subCategoryScore).sort(
      (a, b) => subCategoryScore[b] - subCategoryScore[a]
    )[0];

    // 🎯 Primary interest
    let primaryQuery = {
      published: true,
      category: topCategory,
    };

    if (topCategory === "songs" && topSubCategory) {
      primaryQuery.subCategory = topSubCategory;
    }

    const primary = await Video.find(primaryQuery).limit(12);

    // 🌍 Diversity
    const mixed = await Video.aggregate([
      { $match: { published: true } },
      { $sample: { size: 8 } },
    ]);

    res.json([...primary, ...mixed]);
  } catch (err) {
    console.error("HOME AI ERROR:", err);
    res.status(500).json([]);
  }
});

// ALL VIDEOS (PUBLIC)
router.get("/all", async (req, res) => {
  try {
    const videos = await Video.find({ published: true })
      .populate("channel")
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: "Failed to load videos" });
  }
});


// ✅ SINGLE VIDEO
router.get("/:id", async (req, res) => {
  const video = await Video.findById(req.params.id).populate("channel");
  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }
  res.json(video);
});


module.exports = router;
