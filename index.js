const express = require('express')
const request = require('request')
const fs = require('fs')
const { categorizeContent } = require('./categorized_contents')
const cloudbase = require('@cloudbase/node-sdk')
const app = express()

app.use(express.json())

// 初始化云开发环境
const cloudApp = cloudbase.init({
    env: 'prod-9gevk8v3e303306e'  // 请替换为您的云开发环境 ID
})

const db = cloudApp.database()
const storage = cloudApp.storage()

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

        const contents = [Content]
        const categorizedContents = categorizeContent(contents)

        // 保存分类结果到微信数据库
        db.collection('categorized_contents').add(categorizedContents)
            .then(res => {
                console.log("分类结果已保存到微信数据库中", res)
            })
            .catch(err => {
                console.error("保存到微信数据库时出错", err)
            })

        // 保存文件到云存储
        const filePath = '/tmp/categorized_contents.json'
        fs.writeFileSync(filePath, JSON.stringify(categorizedContents, null, 4), 'utf-8')
        const result = await storage.uploadFile({
            cloudPath: 'categorized_contents.json',
            fileContent: fs.createReadStream(filePath)
        })

        console.log('文件已保存到云存储', result.fileID)

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
