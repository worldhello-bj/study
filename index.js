const express = require('express')
const request = require('request')
const { exec } = require('child_process')
const fs = require('fs')

const app = express()

app.use(express.json())

app.all('/', async (req, res) => {
    console.log('news report', req.body)
    const appid = req.headers['x-wx-from-appid'] || ''
    const { ToUserName, FromUserName, MsgType, Content, CreateTime } = req.body
    console.log('���ͽ��յ��˺�', ToUserName, '����ʱ��', CreateTime)

    if (MsgType === 'text') {
        if (Content === '�ظ�����') {
            await sendmess(appid, {
                touser: FromUserName,
                msgtype: 'text',
                text: {
                    content: 'hello'
                }
            })
        }

        // ���� Python �ű��������ݷ���
        const contents = [Content]
        exec(`python categorize.py '${JSON.stringify(contents)}'`, (error, stdout, stderr) => {
            if (error) {
                console.error(`ִ�д���: ${error}`)
                return
            }
            console.log(`stdout: ${stdout}`)
            console.error(`stderr: ${stderr}`)
        })

        res.send('success')
    } else {
        res.send('success')
    }
})

app.listen(80, function () {
    console.log('service starts!')
})

function sendmess(appid, mess) {
    return new Promise((resolve, reject) => {
        request({
            method: 'POST',
            url: `http://api.weixin.qq.com/cgi-bin/message/custom/send?from_appid=${appid}`,
            body: JSON.stringify(mess)
        }, function (error, response) {
            if (error) {
                console.log('channels report wrong', error)
                reject(error.toString())
            } else {
                console.log('channels report', response.body)
                resolve(response.body)
            }
        })
    })
}
