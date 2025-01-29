const express = require('express');
const request = require('request');
const { categorizeContent } = require('./categorized_contents');
const mysql = require('mysql2/promise'); // 引入 MySQL 驱动
const app = express();

// 初始化 MySQL 连接池（内网配置）
const pool = mysql.createPool({
  host: process.env.DB_HOST,     // 从环境变量读取内网 IP（例如 10.0.0.123）
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,     // 数据库用户名
  password: process.env.DB_PASSWORD, // 数据库密码
  database: process.env.DB_NAME, // 数据库名称
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.json());

app.all('/', async (req, res) => {
  console.log('收到消息:', req.body);
  const appid = req.headers['x-wx-from-appid'] || '';
  const { ToUserName, FromUserName, MsgType, Content, CreateTime } = req.body;

  if (MsgType === 'text') {
    // 1. 处理关键词回复（保留原有逻辑）
    if (Content === '回复文字') {
      await sendmess(appid, {
        touser: FromUserName,
        msgtype: 'text',
        text: { content: 'hello' }
      });
    }

    // 2. 分类内容（保留原有逻辑）
    const contents = [Content];
    const categorizedContents = categorizeContent(contents);

    // 3. 保存到 MySQL（替换原有云开发逻辑）
    try {
      for (const [university, contentsList] of Object.entries(categorizedContents)) {
        for (const content of contentsList) {
          await pool.execute(
            'INSERT INTO categorized_contents (university, content) VALUES (?, ?)',
            [university, content]
          );
        }
      }
      console.log('数据已通过内网写入 MySQL');
    } catch (err) {
      console.error('数据库写入失败:', err);
    }

    res.send('success');
  } else {
    res.send('success');
  }
});

app.listen(80, () => {
  console.log('服务已启动（内网连接 MySQL）');
});

// 保留原有发送消息函数
function sendmess(appid, mess) {
  return new Promise((resolve, reject) => {
    request({
      method: 'POST',
      url: `http://api.weixin.qq.com/cgi-bin/message/custom/send?from_appid=${appid}`,
      body: JSON.stringify(mess)
    }, (error, response) => {
      if (error) {
        console.error('消息发送失败:', error);
        reject(error.toString());
      } else {
        console.log('消息发送成功:', response.body);
        resolve(response.body);
      }
    });
  });
}
