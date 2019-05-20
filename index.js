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

const whiteList = ['lexaich07', 'noomckalb', 'ivanklimuk', 'grablevski'];
const models = ['35.242.205.243:5000', '35.185.0.201']

const bot = new Telegraf(BOT_TOKEN)

function helpMessage(ctx) {
ctx.reply(`
Привет от команды TrollBlock!
Цель проекта TrollBlock - помочь людям самовыражаться в интернете без стеснения.

Сейчас TrollBlock разработал нейронную сеть, которая определяет “токсичность” - показатель грубости и агрессии в сообщении. Мы предлагаем опробовать нейронную сеть в деле. Отправьте сообщение сюда и мы п$

По всем вопросам обращайтесь на @grablevski`)
}

bot.start(helpMessage)
bot.help(helpMessage)

bot.hears(/\ */, (ctx) => {
	var userMessage = ctx['update']['message']['text']
	var userName = ctx['update']['message']['from']['username']
	var userId = ctx['update']['message']['from']['id']

	var queryes = [get_toxic(userMessage,models[0])]

	if(whiteList.indexOf(userName)!=-1){
		models.forEach((item,index)=>{
			if(index==0){return true}
			queryes.push(get_toxic(userMessage,item))
		})
	}

	Promise.all(queryes)
	.then(results=>{
		var out = {
			checked: 0,
			userName: userName,
			message: userMessage, 
			timestamp: new Date().getTime(), 
			toxic: results[0],
			userId: userId
		}
		dboc.insertOne(out)

		var adminAnswer = ''
		var userAnswer = `Степень токсичности сообщения: ${results[0]} %`
		ctx.reply(userAnswerk)

		if(whiteList.indexOf(userName)!=-1){
			results.forEach((toxic,num)=>{
				adminAnswer += ` ${models[num]}: ${toxic} %\n`
			})
			ctx.reply(adminAnswer)
		}		
	})
	.catch(err=>{
		log(err.stack)
	})
})


bot.launch()

})

function impossiblify(coefficient) {
    return Math.round(coefficient*10000)/100 - 0.1
}

function get_toxic(message,api){
	return new Promise((resolve,reject)=>{
		var API_PATH = `http://${api}/`

		var data = {}
		data['telegram'] = message
		var options= {
			method: 'POST',
			uri:API_PATH + 'api',
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
			// log(JSON.stringify(err),'root','exeption')
			console.log(err)
			log(err.stack)
			
		})
	})
	
}

function log(mess){
    const newLineChar = process.platform === 'win32' ? '\r\n' : '\n';
    var date = new Date(); 
    var data_to_append = `${mess}`
    fs.appendFileSync('trollblock.log', `${newLineChar}${data_to_append}`);
}
