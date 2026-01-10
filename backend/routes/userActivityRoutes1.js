const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  addWatchHistory,
  toggleLike,
  getLikedVideos
} = require("../controllers/userActivityController1");

router.post("/watch", auth, addWatchHistory);
router.post("/like", auth, toggleLike);
router.get("/likes", auth, getLikedVideos);

module.exports = router;
