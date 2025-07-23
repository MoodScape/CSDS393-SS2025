const express = require('express');
const router = express.Router();
const SongLog = require('../models/SongLog');

/**
 * @route   POST api/song/log
 * @desc    Log user's song and mood
 * @access  Private (but authentication not implemented yet)
 */
router.post('/log', async (req, res) => {
  try {
    const { song_title, artist, mood } = req.body;
    
    // Basic validation
    if (!song_title || !artist || !mood) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate if mood is in the allowed list
    const allowedMoods = ["Happy", "Sad", "Energetic", "Calm"];
    if (!allowedMoods.includes(mood)) {
      return res.status(400).json({ message: 'Invalid mood selection' });
    }
    
    // TODO: In a real project, user ID should be obtained from auth middleware
    // Here we use a test user ID
    const user_id = "user_test_id";  // Should be replaced after auth integration
    
    // Create new song log
    const newSongLog = new SongLog({
      user_id,
      song_title,
      artist,
      mood,
      // timestamp field will use default value (current time)
    });
    
    // Save to database
    const savedSongLog = await newSongLog.save();
    
    res.status(201).json({
      success: true,
      message: 'Song and mood recorded successfully',
      data: savedSongLog
    });
  } catch (error) {
    console.error('Error logging song:', error);
    res.status(500).json({
      success: false,
      message: 'Server error, unable to log song',
      error: error.message
    });
  }
});

module.exports = router;
