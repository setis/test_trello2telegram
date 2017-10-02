import  TelegramBot  = require('node-telegram-bot-api');
import {TrelloApi} from "../trello/api";
import {EventEmitter} from "events";

const config = require(__dirname + '/../config.json');
export const trello = new TrelloApi(config.trello.key, config.trello.token);
export const tg = new TelegramBot(config.telegram.token, {polling: true});
export const event = new EventEmitter();
tg.getMe().then(console.log)
let Users:Set<number> = new Set();
tg.onText(/\/start/, (msg) => {
    Users.add(msg.chat.id);
    tg.sendMessage(msg.chat.id, "Welcome");

});
tg.onText(/\/stop/, (msg) => {
    Users.delete(msg.chat.id);
    tg.sendMessage(msg.chat.id, "Welcome");

});

event.on('createCard', (data) => {
    var
        model = data.model.name || data.model.fullName,
        user = data.action.memberCreator.fullName,
        card = data.action.data.card;
    let msg = `в ${model} создана карточка 
         [${card.name}](http://trello.com/c/${card.shortLink})
    пользователь:${user}
    дата:${data.action.date}
    `;
    for (let id of Users) {
        tg.sendMessage(id, msg,{
            parse_mode:'Markdown'
        });
    }

});

export default event;