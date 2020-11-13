const replymessages = require('./replymessages.js').replymessageclass;
const messages = new replymessages();
const reply = require('./discord.js').reply
const addusertrail = require('../hive/votetrail.js').adduser
const cleartrail = require('../hive/votetrail.js').cleartrail
const vpcheck = require('../hive/votepowercheck.js').startvpcheck
const send = require('../hive/send.js').verifyargs
const addcoin = require('../mongo/mongo.js').addcoin
const listcoin = require('../mongo/mongo.js').listcoin
const removecoin = require('../mongo/mongo.js').removecoin
const editbaseentry = require('../mongo/mongo.js').editbaseentry
const addentry = require('../mongo/mongo.js').addentry
const addclose = require('../mongo/mongo.js').addclose
const getallfromcollection = require('../mongo/mongo.js').getallfromcollection
const config = require('../../config.js').config

function commandrouter(msg){
  if(msg.author.id !== config.disocrdownerid){
    return
  }
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
  if(command === '!vp'){
    if(args.length === 0){
      reply(msg, messages.commandnihu);
      return;
    }
    else{
      vpcheck(args);
      return;
    }
  }
  if(command === '!send'){
    if(args.length === 3){
      if(args[0] !== 'hive' || args[0] !== 'hbd' || !isNaN(args[1])){
        send(args);
        return;
      }
      else{
        reply(msg, messages.commandnihu);
        return;
      }
    }
    else{
      reply(msg, messages.commandnihu);
      return;
    }
  }
  if(command === '!powerup'){}
  if(command === '!listcoin'){
    listcoin();
    return;
  }
  if(command === '!lisacoin'){
    if(args.length !== 1){
      reply(msg, messages.commandnihu);
      return;
    }
    else{
      addcoin(args[0]);
      return;
    }
  }
  if(command === '!eemaldacoin'){
    if(args.length !== 1){
      reply(msg, messages.commandnihu);
      return;
    }
    else{
      removecoin(args[0]);
      return;
    }
  }
  if(command === '!editbaseentry'){
    if(args.length !== 3){
      reply(msg, messages.commandnihu);
      return;
    }
    else{
      if(args[1] === 'pair' || args[1] === 'type' || args[1] === 'price'){
        editbaseentry(args[0], args[1], args[2]);
        return;
      }
      else{
        reply(msg, messages.commandnihu);
        return;
      }
    }
  }
  if(command === '!newtrade'){
    if(args.length !== 3){
      reply(msg, messages.commandnihu);
      return;
    }
    else{
      if(isNaN(args[1]) || isNaN(args[2])){
        reply(msg, messages.commandnihu);
        return;
      }
      addentry(args[0], args[1], args[2]);
      return;
    }
  }
  if(command === '!closetrade'){
    if(args.length !== 3){
      reply(msg, messages.commandnihu);
      return;
    }
    if(isNaN(args[1]) || isNaN(args[2])){
      reply(msg, messages.commandnihu);
      return;
    }
    else{
      addclose(args[0], args[1], args[2]);
      return;
    }
  }
  if(command === '!coininfo'){
    if(args.length !==  2){
      reply(msg, messages.commandnihu);
      return;
    }
    if(args[1] === 'all'){
      getallfromcollection(args[0]);
      return;
    }
    if(args[1] !== 'open' || args[1] !== 'close' || args[1] !== 'all'){
      reply(msg, messages.commandnihu);
      return;
    }
  }
}


module.exports = {
  commandrouter
}