const express = require("express");
const axios = require("axios");

const router = express.Router();

/**
 * GET /api/utils/youtube-meta?url=
 */
router.get("/youtube-meta", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ message: "URL required" });
    }

    // YouTube oEmbed API (NO API KEY needed)
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      url
    )}&format=json`;

    const response = await axios.get(oembedUrl);

    res.json({
      title: response.data.title,
      author: response.data.author_name,
      thumbnail: response.data.thumbnail_url,
    });
  } catch (err) {
    console.error("YouTube meta error:", err.message);
    res.status(404).json({ message: "Invalid YouTube URL" });
  }
});

module.exports = router;
