const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    youtubeId: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "news",
        "songs",
        "entertainment",
        "education",
        "technology",
        "sports",
        "movies",
        "other",
      ],
      index: true,
    },

    // 🔥 SONG INTELLIGENCE
    subCategory: {
      type: String,
      index: true,
      // sad | love | breakup | emotional | party | romantic | 90s
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },

    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    published: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

videoSchema.index({
  title: "text",
  tags: "text",
  category: "text",
});

module.exports = mongoose.model("Video", videoSchema);
