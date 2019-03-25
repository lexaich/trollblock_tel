const TelegramBot = require('node-telegram-bot-api');
var rpn = require("request-promise")
var fs = require('fs');

var API_PATH = "http://35.185.0.201/"

var ACTIONS = {
  "sendToxicityRequest": "api",
  "sendSaveToxicityRequest": "save"
}
const token = process.argv[2];

const bot = new TelegramBot(token, {polling: true});
 
bot.onText(/\/toxic (.+)/, (msg, match) => {

const chatId = msg.chat.id;
	var id = msg.message_id
	var mess = match[1]

	log(mess+' -- '+msg.from.username,msg.from.username,'phrases')
	var data = {}
	data[id] = mess
	var options= {
		method:'POST',
		uri:API_PATH+'api',
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
		for(var id in res){
			var answer = 'toxic of this message is '+ res[id]
		}
		bot.sendMessage(chatId, answer);
	})
	.catch(err=>{
		bot.sendMessage(chatId, 'error '+JSON.stringify(err));
	})

})

bot.onText(/\/wrong (.+)/, (msg, match) => {

const chatId = msg.chat.id;
	var id = msg.message_id
	var mess = match[1]

	log(mess+' -- wrong',+msg.from.username,'wrong')
	var data = {}
	data['text'] = mess;
	data['url'] = 'https://web.telegram.org/#/im?p=@'+msg.from.username
	var options= {
		method:'POST',
		uri:API_PATH+'save',
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
		if(res.saved){
			bot.sendMessage(chatId, 'saved');
		}else{
			bot.sendMessage(chatId, 'not saved');
		}
	})
	.catch(err=>{
		bot.sendMessage(chatId, 'error '+JSON.stringify(err));
	})
	
})


bot.onText(/\/help (.+)/, (msg, match) => {

	const chatId = msg.chat.id;
	var mess = match[1]

	bot.sendMessage(chatId, `
	Проверить токсичность /toxic некоторая фраза
	Занести ошибочный результат /wrong некоторая фраза
	`);
	
})


function log(mess,username,name){
    const newLineChar = process.platform === 'win32' ? '\r\n' : '\n';
    var date = new Date(); 
    var data_to_append = `${mess}`
    fs.appendFileSync(name+'.log', `${newLineChar}${data_to_append}`);
}