const express = require('express')
const request = require('request')
const { exec } = require('child_process')
const fs = require('fs')
const { categorizeContent, saveToFile } = require('./categorized_contents')

const app = express()

app.use(express.json())

app.all('/', async (req, res) => {
    console.log('news report', req.body)
    const appid = req.headers['x-wx-from-appid'] || ''
    const { ToUserName, FromUserName, MsgType, Content, CreateTime } = req.body
    console.log('推送接收的账号', ToUserName, '创建时间', CreateTime)

    if (MsgType === 'text') {
        if (Content === '回复文字') {
            await sendmess(appid, {
                touser: FromUserName,
                msgtype: 'text',
                text: {
                    content: 'hello'
                }
            })
        }

        const contents = [Content];
        const categorizedContents = categorizeContent(contents);
        saveToFile(categorizedContents, 'categorized_contents.json');
        console.log("分类结果已保存到 categorized_contents.json 文件中");

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

