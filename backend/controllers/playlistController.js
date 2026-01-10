const Playlist = require("../models/Playlist");

exports.createPlaylist = async (req, res) => {
  const playlist = await Playlist.create({
    name: req.body.name,
    user: req.user.id
  });
  res.json(playlist);
};

exports.getUserPlaylists = async (req, res) => {
  const playlists = await Playlist.find({ user: req.user.id }).populate("videos");
  res.json(playlists);
};

exports.addToPlaylist = async (req, res) => {
  const { playlistId, videoId } = req.body;
  await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { videos: videoId } }
  );
  res.json({ message: "Added to playlist" });
};
