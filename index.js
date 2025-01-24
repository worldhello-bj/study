const express = require('express')
const request = require('request-promise-native') // ʹ��request-promise-native���request
const app = express()

// ǿ��ָ�����������
app.use(express.json({
    type: 'application/json; charset=utf-8', // ��ʽָ��JSON����
    verify: (req, res, buf) => {
        req.rawBody = buf.toString('utf8') // ����ԭʼBuffer����У��
    }
}))

// ����text������Ϣ������΢��XML��ʽ��
app.use(express.text({
    type: ['text/xml', 'text/plain'],
    defaultCharset: 'utf-8'
}))

// ͨ�ñ��봦���м��
app.use((req, res, next) => {
    // ������Ӧͷ����
    res.setHeader('Content-Type', 'application/json; charset=utf-8')

    // ��־���ǿ��UTF-8
    console.log('�յ�ԭʼ������:', req.rawBody ? req.rawBody : '')
    console.log('������������:', JSON.stringify(req.body, null, 2))

    // ת����UTF-8�����������
    if (Buffer.isBuffer(req.body)) {
        try {
            req.body = JSON.parse(req.body.toString('utf8'))
        } catch (e) {
            console.error('����ת��ʧ��:', e)
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

        // ��־�����ӱ����ʶ
        console.log('��Ϣ������֤:', {
            ToUserName: ToUserName?.toString('hex'),
            Content: Buffer.from(Content).toString('hex')
        })

        if (MsgType === 'text') {
            const responseMap = {
                '�ظ�����': {
                    msgtype: 'text',
                    text: { content: '������ʾ�����Ļظ�' }
                },
                // ������Ϣ����...
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
        console.error('�������:', e)
        res.status(500).send('����������')
    }
})

// ������Ϣ������ӱ��봦��
async function sendmess(appid, mess) {
    try {
        const options = {
            method: 'POST',
            url: `http://api.weixin.qq.com/cgi-bin/message/custom/send?from_appid=${appid}`,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(mess, (key, value) => {
                // ���������ַ�����
                return typeof value === 'string' ?
                    value.replace(/[\u007F-\uFFFF]/g, chr => '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).slice(-4))
                    : value
            })
        }

        const response = await request(options)
        console.log('΢��API��Ӧ:', {
            status: response.statusCode,
            body: response.body.toString('utf8') // ǿ��ת����Ӧ�����
        })
        return response.body
    } catch (error) {
        console.error('API����ʧ��:', error)
        throw error
    }
}

app.listen(80, () => {
    console.log('���������ɹ�������ģʽ:', process.env.LANG || 'δָ��')
})


