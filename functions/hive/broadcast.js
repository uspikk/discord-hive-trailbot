let hive = require('@hiveio/hive-js');
const log = require('../discord/discord.js').log
const config = require('../../config.js').config

const queue = new broadcastqueue();

function broadcastqueue(){
  this.txs = [];
}

function addtoqueue(op){
  let pushop = [op, {errors:0}]
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
  let transaction = queue.txs.splice(0, 1);
  transaction = transaction[0]; 
  hive.broadcast.send({
    extensions: [],
    operations: [transaction[0]]},
  [config.trailwif], (err, result) => {
    if(err){
      console.log(err)
      log('err', `broadcast:${transaction[1].errors}`, JSON.stringify(err));
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