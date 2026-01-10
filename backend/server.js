const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
