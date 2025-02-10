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
  const { ToUserName, FromUserName, MsgType, Content } = req.body;

  // 立即响应微信服务器
  res.send('success');

  if (MsgType === 'text') {
    // 异步处理业务逻辑
    try {
      console.log('处理文本消息:', Content);
      if (Content.startsWith('我要爆料')) {
        console.log('开始分类处理爆料内容');
        const categorizedContents = categorizeContent([Content]);
        const insertValues = [];

        for (const [university, contentsList] of Object.entries(categorizedContents)) {
          contentsList.forEach(content => {
            insertValues.push([university, content]);
          });
        }

        if (insertValues.length > 0) {
          await pool.query(
            'INSERT INTO categorized_contents (university, content) VALUES ?',
            [insertValues]
          );
          console.log(`新增${insertValues.length}条分类内容`);
          await sendmess(appid, {
            touser: FromUserName,
            msgtype: 'text',
            text: { content: `感谢您的爆料，内容已保存。` }
          });
        } else {
          console.log('未能识别爆料内容');
          await sendmess(appid, {
            touser: FromUserName,
            msgtype: 'text',
            text: { content: `未能识别您的爆料内容，请检查格式。` }
          });
        }
      } else if (Content.startsWith('我想了解')) {
        console.log('开始处理了解请求');
        const university = Content.replace('我想了解', '').trim();
        // 查询大学信息
        const [uniCheck] = await pool.execute(
          'SELECT 1 FROM categorized_contents WHERE university = ? LIMIT 1',
          [university]
        );

        if (uniCheck.length > 0) {
          console.log(`找到${university}的信息`);
          // 找到对应大学，返回所有内容
          const [contents] = await pool.execute(
            'SELECT content FROM categorized_contents WHERE university = ?',
            [university]
          );

          const replyText = contents.length > 0 
            ? `${university}相关内容：\n${contents.map(c => `· ${c.content}`).join('\n')}`
            : `暂时没有${university}的相关内容`;

          await sendmess(appid, {
            touser: FromUserName,
            msgtype: 'text',
            text: { content: replyText }
          });
        } else {
          console.log(`未找到${university}的信息`);
          await sendmess(appid, {
            touser: FromUserName,
            msgtype: 'text',
            text: { content: `暂时没有${university}的相关内容` }
          });
        }
      } else {
        console.log('未能识别的信息类型');
        // 预留接口未来使用
      res.send({
        ToUserName: FromUserName,
        FromUserName: ToUserName,
        
        MsgType: 'text',
        Content: '这是回复的消息'
      });
      }
    } catch (err) {
      console.error('消息处理异常:', err);
    }
  }
});

app.listen(80, () => {
  console.log('服务已启动（内网连接 MySQL）');
});

// 保留原有发送消息函数
async function sendmess(appid, mess) {
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
