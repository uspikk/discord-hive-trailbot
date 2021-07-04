const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../../config.js').config;
let boot;

client.on('ready', () => {
  const bootscript = require('../../index.js').bootscript
  const gettokenvp = require('../hive/hiveenginevpchecker.js').hevpcheck
  console.log(`Logged in as ${client.user.tag}!`);
  bootscript();
  gettokenvp();
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
  var nextstring = false
  if(type === 'log')type = '👨‍💻'
  if(type === 'err')type = '❌'
  const typewhere = type + where
  if(msg.length > 1990){
    nextstring = msg.substring(1990)
    msg = msg.slice(0, 1990);
  }
  msg='```'+msg+'```'
  client.channels.cache.get(config.logchannel).send(typewhere).then(client.channels.cache.get(config.logchannel).send(msg)).then(function(){
    if(nextstring){
      log(type, where, nextstring)
      return;
    }
  })
}

function notification(message){
  //client.channels.cache.get('792348422316883998').guild.members.cache.forEach(member => console.log("===>>>", member.user.username));
 client.users.cache.get('243939614782521356').send(message);
 return;
}


module.exports = {
  boot,
  log,
  reply,
  notification
}