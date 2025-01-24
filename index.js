const express = require('express')
const request = require('request')
const app = express()

// 强制指定请求体编码
app.use(express.json({
    type: 'application/json; charset=utf-8', // 显式指定JSON编码
    verify: (req, res, buf) => {
        req.rawBody = buf.toString('utf8') // 保留原始Buffer用于校验
    }
}))

// 处理text类型消息（兼容微信XML格式）
app.use(express.text({
    type: ['text/xml', 'text/plain'],
    defaultCharset: 'utf-8'
}))

// 通用编码处理中间件
app.use((req, res, next) => {
    // 设置响应头编码
    res.setHeader('Content-Type', 'application/json; charset=utf-8')

    // 日志输出强制UTF-8
    console.log('收到原始请求体:', req.rawBody ? req.rawBody : '')
    console.log('解析后请求体:', JSON.stringify(req.body, null, 2))

    // 转换非UTF-8编码的请求体
    if (Buffer.isBuffer(req.body)) {
        try {
            req.body = JSON.parse(req.body.toString('utf8'))
        } catch (e) {
            console.error('编码转换失败:', e)
        }
    }
    next()
})

app.all('/', async (req, res) => {
    try {
        const appid = req.headers['x-wx-from-appid'] || ''
        const {
            ToUserName,
            FromUserName,
            MsgType,
            Content,
            CreateTime
        } = req.body

        // 日志输出添加编码标识
        console.log('消息编码验证:', {
            ToUserName: ToUserName?.toString('hex'),
            Content: Buffer.from(Content).toString('hex')
        })

        if (MsgType === 'text') {
            const responseMap = {
                '回复文字': {
                    msgtype: 'text',
                    text: { content: '正常显示的中文回复' }
                },
                // 其他消息类型...
            }

            if (responseMap[Content]) {
                await sendmess(appid, {
                    touser: FromUserName,
                    ...responseMap[Content]
                })
            }
        }

        res.send('success')
    } catch (e) {
        console.error('处理错误:', e)
        res.status(500).send('服务器错误')
    }
})

// 发送消息函数添加编码处理
function sendmess(appid, mess) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            url: `http://api.weixin.qq.com/cgi-bin/message/custom/send?from_appid=${appid}`,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(mess, (key, value) => {
                // 处理特殊字符编码
                return typeof value === 'string' ?
                    value.replace(/[\u007F-\uFFFF]/g, chr => '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4))
                    : value
            })
        }

        request(options, (error, response) => {
            if (error) {
                console.error('API请求失败:', error)
                reject(error)
            } else {
                console.log('微信API响应:', {
                    status: response.statusCode,
                    body: response.body.toString('utf8') // 强制转换响应体编码
                })
                resolve(response.body)
            }
        })
    })
}

app.listen(80, () => {
    console.log('服务启动成功，编码模式:', process.env.LANG || '未指定')
})