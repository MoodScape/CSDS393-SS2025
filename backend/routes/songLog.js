const express = require('express');
const router = express.Router();
const SongLog = require('../models/SongLog');

/**
 * @route   POST api/song/log
 * @desc    记录用户的歌曲和心情
 * @access  Private (但在当前实现中暂不处理身份验证)
 */
router.post('/log', async (req, res) => {
  try {
    const { song_title, artist, mood } = req.body;
    
    // 基本验证
    if (!song_title || !artist || !mood) {
      return res.status(400).json({ message: '所有字段都是必填的' });
    }
    
    // 验证心情是否在允许的列表中
    const allowedMoods = ["Happy", "Sad", "Energetic", "Calm"];
    if (!allowedMoods.includes(mood)) {
      return res.status(400).json({ message: '无效的心情选择' });
    }
    
    // TODO: 在实际项目中，应从身份验证中间件获取用户ID
    // 在此处我们使用一个测试用户ID
    const user_id = "user_test_id";  // 在集成身份验证后应替换
    
    // 创建新的歌曲记录
    const newSongLog = new SongLog({
      user_id,
      song_title,
      artist,
      mood,
      // timestamp 字段将使用默认值（当前时间）
    });
    
    // 保存到数据库
    const savedSongLog = await newSongLog.save();
    
    res.status(201).json({
      success: true,
      message: '歌曲和心情已成功记录',
      data: savedSongLog
    });
  } catch (error) {
    console.error('记录歌曲时出错:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法记录歌曲',
      error: error.message
    });
  }
});

module.exports = router;
