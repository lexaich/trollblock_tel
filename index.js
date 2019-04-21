"use strict"
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const rpn = require("request-promise")
const MongoClient = require('mongodb').MongoClient
const fs = require('fs');

const BOT_TOKEN = process.argv[2];

var url = 'mongodb://localhost:27017/'

 MongoClient.connect(url,{ useNewUrlParser: true },function(err, db){
 	if (err){
 		log(JSON.stringify(err),'root','exeption')
 		console.log(err)
 		return false
 	};

 	var dboc = db.db('trollblock').collection('info')
	dboc.insert(res,function(err,result){
		if(err){
			config.log(err,'trollblock')
			console.log(err)
		}
		console.log(result)
	})

const bot = new Telegraf(BOT_TOKEN)

bot.start((ctx) => ctx.reply('Используемые команды: /help и /stats'))
bot.help((ctx) => ctx.reply(`
Вас приветствует бот команды TrollBlock.
Цель проекта TrollBlock - помочь людям самовыражаться в интернете без стеснения. 

Сейчас TrollBlock разработал нейронную сеть, которая определяет “токсичность” сообщений и предлагает опробовать её в деле. Отправьте ваше сообщение сюда и мы покажем степень его токсичности. (100% - очень токсичное сообщение!)

Совместно с SocialWeekend мы проводим конкурс на самое токсичное сообщение. Приз за самые токсичное сообщение - билет в оперный театр. Итоги конкурса будут подведены в 21.00, 25 апреля во время эфира с командой TrollBlock.

Условие конкурса - победное сообщение не должно содержать нецензурной лексики. 

Чтобы посмотреть лидирующее сообщение, воспользуйтесь командой /stats. 

По всем вопросам обращайтесь на (tg:) @grablevski
	`))



bot.hears('/stats', (ctx) => {
	// var usetMessage = ctx['update']['message']['text']
//console.log(1234)
dboc.find().sort( {toxic:-1} ).limit(3).toArray()
.then(res=>{
//console.log(res)
//return true
	//сортировка по токсичности
var stats = res

	ctx.reply(`
########################################
Место: 1
Токсичность: ${stats[0].toxic}%
${stats[0].message}
########################################
Место: 2
Токсичность: ${stats[1].toxic}%
${stats[1].message}
########################################
Место: 3
Токсичность: ${stats[2].toxic}%
${stats[2].message}
########################################
		`)

})


})

bot.hears(/\ */, (ctx) => {
	var userMessage = ctx['update']['message']['text']
	get_toxic(userMessage)
	.then(res=>{
if(res==20.38||res==20.39){
	ctx.reply('Это англиский текст. Пиши на русском')
}else{
		ctx.reply('toxic of this message is '+res+'%')
		var out = {checked:0,userName:ctx['update']['message']['from']['username'],message:userMessage,timestamp:new Date().getTime(),toxic:res,userId:ctx['update']['message']['from']['id']}
		dboc.insertOne(out).then(res=>{})
}
	})

})


bot.launch()



 })


function get_toxic(message){
	return new Promise((resolve,reject)=>{
		var API_PATH = "http://35.185.0.201/"
		// var API_PATH = "http://localhost:5000/"

		var data = {}
		data['telegram'] = message
		var options= {
			method:'POST',
			uri:API_PATH+'api', // путь до списка всех матчей
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
			resolve(Math.round(res['telegram']*10000)/100)
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