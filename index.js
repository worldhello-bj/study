
const express = require('express')
const request = require('request')

const app = express()

app.use(express.json())

app.all('/', async (req, res) => {
    console.log('��Ϣ����', req.body)
    // ��header��ȡappid�����from-appid�����ڣ�������Դ���ó���������ֱ�Ӵ����ַ�����ʹ�û��������˺ŷ����Ƶ���
    const appid = req.headers['x-wx-from-appid'] || ''
    const { ToUserName, FromUserName, MsgType, Content, CreateTime } = req.body
    console.log('���ͽ��յ��˺�', ToUserName, '����ʱ��', CreateTime)
    if (MsgType === 'text') {
        if (Content === '�ظ�����') { // С���򡢹��ںſ���
            await sendmess(appid, {
                touser: FromUserName,
                msgtype: 'text',
                text: {
                    content: '���ǻظ�����Ϣ'
                }
            })
        } else if (Content === '�ظ�ͼƬ') { // С���򡢹��ںſ���
            await sendmess(appid, {
                touser: FromUserName,
                msgtype: 'image',
                image: {
                    media_id: 'P-hoCzCgrhBsrvBZIZT3jx1M08WeCCHf-th05M4nac9TQO8XmJc5uc0VloZF7XKI'
                }
            })
        } else if (Content === '�ظ�����') { // �����ںſ���
            await sendmess(appid, {
                touser: FromUserName,
                msgtype: 'voice',
                voice: {
                    media_id: '06JVovlqL4v3DJSQTwas1QPIS-nlBlnEFF-rdu03k0dA9a_z6hqel3SCvoYrPZzp'
                }
            })
        } else if (Content === '�ظ���Ƶ') {  // �����ںſ���
            await sendmess(appid, {
                touser: FromUserName,
                msgtype: 'video',
                video: {
                    media_id: 'XrfwjfAMf820PzHu9s5GYsvb3etWmR6sC6tTH2H1b3VPRDedW-4igtt6jqYSBxJ2',
                    title: '΢�����йܹٷ��̳�',
                    description: '΢�Źٷ��ŶӴ��죬����ҵ�񳡾���ʵս��ѧ'
                }
            })
        } else if (Content === '�ظ�����') {  // �����ںſ���
            await sendmess(appid, {
                touser: FromUserName,
                msgtype: 'music',
                music: {
                    title: 'Relax�������Ƽ�����',
                    description: 'ÿ���Ƽ�һ�����������֣���л������',
                    music_url: 'https://c.y.qq.com/base/fcgi-bin/u?__=0zVuus4U',
                    HQ_music_url: 'https://c.y.qq.com/base/fcgi-bin/u?__=0zVuus4U',
                    thumb_media_id: 'XrfwjfAMf820PzHu9s5GYgOJbfbnoUucToD7A5HFbBM6_nU6TzR4EGkCFTTHLo0t'
                }
            })
        } else if (Content === '�ظ�ͼ��') {  // С���򡢹��ںſ���
            await sendmess(appid, {
                touser: FromUserName,
                msgtype: 'link',
                link: {
                    title: 'Relax�������Ƽ�����',
                    description: 'ÿ���Ƽ�һ�����������֣���л������',
                    thumb_url: 'https://y.qq.com/music/photo_new/T002R300x300M000004NEn9X0y2W3u_1.jpg?max_age=2592000', // ֧��JPG��PNG��ʽ���Ϻõ�Ч��Ϊ��ͼ360*200��Сͼ200*200
                    url: 'https://c.y.qq.com/base/fcgi-bin/u?__=0zVuus4U'
                }
            })
        } else if (Content === '�ظ�С����') { // ��С�������
            await sendmess(appid, {
                touser: FromUserName,
                msgtype: 'miniprogrampage',
                miniprogrampage: {
                    title: 'С����Ƭ����',
                    pagepath: 'pages/index/index', // ��app.json���룬֧�ֲ���������pages/index/index?foo=bar
                    thumb_media_id: 'XrfwjfAMf820PzHu9s5GYgOJbfbnoUucToD7A5HFbBM6_nU6TzR4EGkCFTTHLo0t'
                }
            })
        }
        res.send('success')
    } else {
        res.send('success')
    }
})

app.listen(80, function () {
    console.log('���������ɹ���')
})

function sendmess(appid, mess) {
    return new Promise((resolve, reject) => {
        console.log('������Ϣ��', mess);
        request({
            method: 'POST',
            url: `http://api.weixin.qq.com/cgi-bin/message/custom/send?from_appid=${appid}`,
            body: JSON.stringify(mess),
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }, function (error, response) {
            if (error) {
                console.log('�ӿڷ��ش���', error)
                reject(error.toString())
            } else {
                console.log('�ӿڷ�������', response.body)
                resolve(response.body)
            }
        })
    })
}
