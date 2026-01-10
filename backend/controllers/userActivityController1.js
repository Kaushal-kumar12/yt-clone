const User = require("../models/User");

exports.addWatchHistory = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    $push: { watchHistory: { video: req.body.videoId } }
  });
  res.json({ message: "History saved" });
};

exports.toggleLike = async (req, res) => {
  const user = await User.findById(req.user.id);
  const videoId = req.body.videoId;

  const liked = user.likedVideos.includes(videoId);

  await User.findByIdAndUpdate(req.user.id, {
    [liked ? "$pull" : "$addToSet"]: { likedVideos: videoId }
  });

  res.json({ liked: !liked });
};

exports.getLikedVideos = async (req, res) => {
  const user = await User.findById(req.user.id).populate("likedVideos");
  res.json(user.likedVideos);
};
