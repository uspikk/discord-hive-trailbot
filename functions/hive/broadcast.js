let hive = require('@hiveio/hive-js');
const log = require('../discord/discord.js').log
const config = require('../../config.js').config

const queue = new broadcastqueue();

function broadcastqueue(){
  this.txs = [];
}

function addtoqueue(op, key){
  let pushop = [op, {errors:0, 'active':key}]
  queue.txs.push(pushop);
  return;
}

function adderrorqueue(tx){
  if(tx[1].errors > 3){
  log('log', 'adderrorqueue', `removed tx from queue`);
  return;
  }
  tx[1].errors++;
  queue.txs.push(tx);
  return;
}


function broadcast(){
  if(queue.txs.length === 0) return;
  let key = config.postingwif
  if(queue.txs[0][1].active === true) key = config.activewif
  let transaction = queue.txs.splice(0, 1);
  transaction = transaction[0]; 
  hive.broadcast.send({
    extensions: [],
    operations: [transaction[0]]},
  [key], (err, result) => {
    if(err){
      log('err', `broadcast:${transaction[1].errors}`, JSON.stringify(err));//.data.stack[0].format
      adderrorqueue(transaction);
      return;
    }
    if(result){
      log('log', 'broadcast', JSON.stringify(result.operations));
      return;
    }
  });
}

module.exports = {
  addtoqueue,
  broadcast
}