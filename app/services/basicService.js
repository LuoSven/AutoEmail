let commonService = require('./commonService')
const nodemailer = require('nodemailer');
let fs = require('fs')
var multipart = require('connect-multiparty');
let path = require('path')
let multiparty = require('multiparty')

let sendMail = {
    userAccount: '253484323@qq.com',
    password: 'bzkhhamcrnwebgde',
    host: 'smtp.qq.com',
    port: 465,
    ssl:true,
}

var multipartMiddleware = multipart();

function apiInit(app) {
    var mainUrl = '/api/db/baisc/';


    app.post(mainUrl + 'sendEmail', function (req, res) {
        //生成multiparty对象，并配置上传目标路径
        let now = new Date()
        let nowYear = now.getFullYear();
        let nowDay = now.format('yyyyMMdd')

        let uploadDir = './data/' + nowYear + '/' + nowDay;
        if (!fsExistsSync(uploadDir)) {
            fs.mkdirSync(uploadDir)
        }

        let form = new multiparty.Form({uploadDir});
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.log('parse error: ' + err);
                return
            }

            let emailOb = {
                from: sendMail.userAccount,
                to: JSON.parse(fields.toEmails[0]),
                subject: fields.title[0],
                html: `<b>${fields.html[0]}</b>`,
                attachments: []
            }


            Object.keys(files).forEach(o => {
                let file = files[o][0]
                emailOb.attachments.push({
                    filename: file.originalFilename,
                    filePath: '../../' + file.path,
                })
            })
            sendEmails(emailOb)

            res.json({code: 1})

        });

        function fsExistsSync(path) {
            try {
                fs.accessSync(path, fs.F_OK);
            } catch (e) {
                return false;
            }
            return true;
        }
    });

    function processFile() {
        if (err) {
            console.log('parse error: ' + err);
            return
        }

        let emailOb = {
            from: sendMail.userAccount,
            to: JSON.parse(fields.toEmails[0]),
            subject: fields.title[0],
            html: `<b>${fields.html[0]}</b>`,
            attachments: []
        }


        Object.keys(files).forEach(o => {
            let file = files[o][0]
            emailOb.attachments.push({
                filename: file.originalFilename,
                filePath: '../../' + file.path,
            })
        })
        sendEmails(emailOb)

        res.json({code: 1})
    }


    //发送多份邮件
    function sendEmails(mailOptions) {
        mailOptions.to.forEach(o => {

            let s = Object.assign({}, mailOptions)
            s.to = o.email;
            sendEmail(s);


        })
    }

    //发送单份邮件
    function sendEmail(mailOptions) {
        let transporter = nodemailer.createTransport('SMTP', {
            // host: 'smtp.ethereal.email',
            host: 'smtp.qq.com',
            port: 465, // SMTP 端口
            secureConnection: true, // 使用了 SSL
            secure: true,
            auth: {
                user: sendMail.userAccount,
                // 这里密码不是qq密码，是你设置的smtp授权码
                pass: sendMail.password,
            }
        });

        console.log(mailOptions.attachments[0])

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            debugger;

            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
        });
    }

}

//转为小数
function padding3(num, length) {
    var decimal = num / Math.pow(10, length);
    //toFixed指定保留几位小数
    decimal = decimal.toFixed(length) + "";
    return decimal.substr(decimal.indexOf(".") + 1);
}


module.exports = {
    apiInit
}






