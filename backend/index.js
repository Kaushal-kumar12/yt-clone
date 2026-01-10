const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

/* ======================
   MIDDLEWARE
====================== */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://yt-clone-pif3.vercel.app", // update after deploy
    ],
    credentials: true,
  })
);

app.use(express.json());

/* ======================
   DATABASE
====================== */
connectDB();

/* ======================
   ROUTES
====================== */

// AUTH
app.use("/api/auth", require("./routes/authRoutes"));

// VIDEOS
app.use("/api/videos", require("./routes/videoRoutes"));

// CHANNELS
app.use("/api/channels", require("./routes/channelRoutes"));

// COMMENTS
app.use("/api/comments", require("./routes/commentRoutes"));

// PLAYLISTS
app.use("/api/playlists", require("./routes/playlistRoutes"));

// WATCH HISTORY
app.use("/api/activity", require("./routes/activityRoutes"));

// LIKES
app.use("/api/likes", require("./routes/likeRoutes"));

// RECOMMENDATION
app.use("/api/recommend", require("./routes/recommendRoutes"));

// ADMIN
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/admin", require("./routes/adminUserRoutes"));

/* ======================
   HEALTH CHECK (OPTIONAL)
====================== */
app.get("/", (req, res) => {
  res.json({ status: "Backend running 🚀" });
});

/* ======================
   EXPORT FOR VERCEL
====================== */
module.exports = app;
