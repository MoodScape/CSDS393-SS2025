const mongoose = require("mongoose");

const songLogSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  song_title: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    required: true,
    enum: ["Happy", "Sad", "Energetic", "Calm"] // Only allow these fixed values
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt
});

const SongLog = mongoose.model("SongLog", songLogSchema);

module.exports = SongLog;
