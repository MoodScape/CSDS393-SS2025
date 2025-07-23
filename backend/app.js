const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// 引入路由
const songLogRoutes = require('./routes/songLog');

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 连接到MongoDB
mongoose.connect('mongodb://localhost:27017/moodscape', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => console.error('MongoDB连接失败:', err));

// 使用路由
app.use('/api/song', songLogRoutes);

// 基本路由
app.get('/', (req, res) => {
  res.send('MoodScape API 正在运行');
});

// 启动服务器
app.listen(PORT, () => {
  console.log(服务器运行在端口 );
});

module.exports = app;
