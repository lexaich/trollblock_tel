"use strict"
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const rpn = require("request-promise")
const MongoClient = require('mongodb').MongoClient
const fs = require('fs');

const BOT_TOKEN = process.env.BOT_TOKEN;

var url = 'mongodb://localhost:27017/'

MongoClient.connect(url,{ useNewUrlParser: true },function(err, db) {
 	if (err){
 		log(JSON.stringify(err),'root','exeption')
 		console.log(err)
 		return false
 	};

 	var dboc = db.db('trollblock').collection('info')

const whiteList = ['lexaich07','noomckalb'];

const bot = new Telegraf(BOT_TOKEN)

bot.start((ctx) => ctx.reply('Используемые команды: /help и /stats'))
bot.help((ctx) => ctx.reply(`
Вас приветствует бот команды TrollBlock.
Цель проекта TrollBlock - помочь людям самовыражаться в интернете без стеснения. 

Сейчас TrollBlock разработал нейронную сеть, которая определяет “токсичность” - показатель грубости и агрессии в сообщении. Мы предлагаем опробовать нейронную сеть в деле. Отправьте ваше сообщение сюда и мы покажем степень его токсичности. (100% - очень токсичное сообщение!)

Совместно с SocialWeekend мы проводим конкурс на самое токсичное сообщение. Приз за самые токсичное сообщение - билет в оперный театр. Итоги конкурса будут подведены в 21.00, 25 апреля во время эфира с командой TrollBlock.

Условие конкурса - победное сообщение не должно содержать нецензурной лексики. 

Чтобы посмотреть лидирующие сообщения, воспользуйтесь командой /stats. 

По всем вопросам обращайтесь на (tg:) @grablevski`))



bot.hears('/stats', (ctx) => {
    var userId = ctx['update']['message']['from']['id']
    dboc.find({ checked: 1 }).sort({toxic:-1, timestamp: 1}).limit(3).toArray()
    .then(stats => {
        dboc.find({userId: userId}).sort({toxic: -1}).limit(1).toArray()
        .then(userStats => {
            var message = ""

            stats.map((element, index) => {
                message += `
Место: ${index + 1}
Токсичность: ${element.toxic}%
${element.message}
                `
            })

            if (userStats.length > 0) {
                userStats = userStats[0]
                var additionalMessage = ""
                if ((userStats["checked"] != 1)  && (userStats["toxic"] > stats[stats.length - 1]["toxic"])) {
                    additionalMessage = "(находится на стадии проверки)"
                }
                message += `
...

Ваш лучший комментарий ${additionalMessage}
Токсичность: ${userStats.toxic}%
${userStats.message} 
        `
}
            ctx.reply(message)

        })
    })

})

bot.hears(/\ */, (ctx) => {
	var userMessage = ctx['update']['message']['text']
	var userName = ctx['update']['message']['from']['username']
	var prm1 = get_toxic(userMessage,'')
	.then(res=>{
		//ctx.reply('Степень токсичности сообщения: '+res+'%')
		var out = {
            checked: 0,
            userName: ctx['update']['message']['from']['username'],
            message: userMessage, 
            timestamp: new Date().getTime(), 
            toxic: res,
            userId: ctx['update']['message']['from']['id']
        }
		dboc.insertOne(out).then(res=>{})
	    return res;
	})
	var prm2 = get_toxic(userMessage,'admin')
	
	Promise.all([prm1,prm2])
	.then(results=>{
ctx.reply('Степень токсичности сообщения: '+results[1]+'%')
		if(whiteList.indexOf(userName)!=-1){
			ctx.reply(`
Версия1: ${results[0]}%
Версия2: ${results[1]}%

`)
		}
	})

})


bot.launch()

})

function impossiblify(coefficient) {
    return Math.round(coefficient*10000)/100 - 0.1
}

function get_toxic(message,flag){
	return new Promise((resolve,reject)=>{
		var API_PATH = "http://35.185.0.201/"
		if(flag=='admin'){
			var API_PATH = "http://35.242.205.243:5000/"
		}
		// var API_PATH = "http://localhost:5000/"

		var data = {}
		data['telegram'] = message
		var options= {
			method: 'POST',
			uri:API_PATH + 'api', // путь до списка всех матчей
			body:JSON.stringify(data),
			headers: {
			'Content-Type': 'application/json',
			"Platforma":"node.js/telegram_bot",
			"User-Agent":"Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36",
			},
		}
		rpn( options )
		.then(res=>{
			var res = JSON.parse(res)
            var coefficient = impossiblify(res['telegram'])
            resolve(coefficient)
		})
		.catch(err=>{
			log(JSON.stringify(err),'root','exeption')
			console.log(err)
		})
	})
	
}


function log(mess,username,name){
    const newLineChar = process.platform === 'win32' ? '\r\n' : '\n';
    var date = new Date(); 
    var data_to_append = `${mess}`
    fs.appendFileSync(name+'.log', `${newLineChar}${data_to_append}`);
}
