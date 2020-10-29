const replymessages = require('./replymessages.js').replymessageclass;
const messages = new replymessages();
const reply = require('./discord.js').reply
const addusertrail = require('../hive/votetrail.js').adduser
const cleartrail = require('../hive/votetrail.js').cleartrail

function commandrouter(msg){
  const args = msg.content.trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if(command === '!help'){
    reply(msg, messages.helpmessage)
    return;
  }
  if(command === '!addtrail'){
    if(args.length === 2 && args[1]==='inf' || !isNaN(args[1])){
      addusertrail(args);
      return;
    }
    else{
      reply(msg, messages.commandnihu);
      return;
    }
  }
  if(command === '!cleartrail'){
    cleartrail();
    return;
  }
}


module.exports = {
  commandrouter
}