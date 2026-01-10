const express = require("express");
const router = express.Router();
const UserHistory = require("../models/UserHistory");

/**
 * Save watch history
 */
router.post("/", async (req, res) => {
  try {
    const { userId, videoId, category } = req.body;

    await UserHistory.create({
      userId,
      videoId,
      category,
    });

    res.json({ message: "Watch history saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save history" });
  }
});

module.exports = router;
