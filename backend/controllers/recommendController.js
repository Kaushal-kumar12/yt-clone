const Video = require("../models/Video");
const User = require("../models/User");

exports.getHomeRecommendations = async (req, res) => {
  const user = await User.findById(req.user.id).populate("watchHistory.video");

  if (!user.watchHistory.length) {
    const random = await Video.aggregate([{ $sample: { size: 20 } }]);
    return res.json(random);
  }

  const categories = user.watchHistory.map(v => v.video.category);

  const related = await Video.find({
    category: { $in: categories }
  }).limit(12);

  const random = await Video.aggregate([{ $sample: { size: 8 } }]);

  res.json([...related, ...random]);
};

exports.getWatchSuggestions = async (req, res) => {
  const video = await Video.findById(req.params.id);

  const related = await Video.find({
    category: video.category,
    _id: { $ne: video._id }
  }).limit(8);

  const random = await Video.aggregate([{ $sample: { size: 2 } }]);

  res.json([...related, ...random]);
};
