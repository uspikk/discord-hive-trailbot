const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../../config.js').config;
let boot;

client.on('ready', () => {
  const bootscript = require('../../index.js').bootscript
  console.log(`Logged in as ${client.user.tag}!`);
  bootscript();
});

client.on('message', msg => {
  let router = require('./commandrouter.js').commandrouter
  if(msg){
    router(msg);
  }
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});

client.login(config.discordtoken);


function reply(ogmsg, msg){
  client.channels.cache.get(ogmsg.channel.id).send(msg);
  return;
}


function log(type, where, msg){
  if(type === 'log')type = '👨‍💻'
  if(type === 'err')type = '❌'
  type = type + where
  msg='```'+msg+'```'
  client.channels.cache.get(config.logchannel).send(type).then(client.channels.cache.get(config.logchannel).send(msg))
}


module.exports = {
  boot,
  log,
  reply
}