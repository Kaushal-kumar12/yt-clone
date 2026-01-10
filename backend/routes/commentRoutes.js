const express = require("express");
const Comment = require("../models/Comment");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

// DELETE COMMENT
router.delete("/:id", auth, admin, async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id);
  res.json({ message: "Comment deleted" });
});

module.exports = router;
