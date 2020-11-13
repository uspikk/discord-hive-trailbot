let hive = require('@hiveio/hive-js');
const config = require('../../config.js').config
const log = require('../discord/discord.js').log
const addtoqueue = require('./broadcast.js').addtoqueue

function verifyargs(args){
  hive.api.getAccounts([config.hiveacc, args[2]], function(err, result) {
    if(err) log('err', 'verifyargs', JSON.strigify(err));
    if(result.length < 2) log('err', 'verifyargs', 'Ei leidnud kasutajat!');
    if(result.length === 2){
      let balance;
      if(args[0] === 'hive') balance = parseFloat(result[0].balance);
      if(args[0] === 'hbd') balance = parseFloat(result[0].hbd_balance);
      if(balance < args[1]){
        log('err', 'verifyargs', 'Kasutajal pole piisavalt raha');
        return;
      }
      transactionbuilder(args);
      return;
    }
  });
}

function transactionbuilder(args){
  /*let nai;
  if(args[0] === 'hive')nai = '@@000000021';
  if(args[0] === 'hbd')nai = '@@000000013'
  let op =   [
    "transfer",
    {
      "from": config.hiveacc,
      "to": args[2],
      "amount": {
        "amount": args[1],
        "precision": 3,
        "nai": "@@000000021"
      },
      "memo": ""
    }
  ]*/
  let kogus = parseFloat(args[1]).toFixed(3); 
  if(args[0] === 'hive') kogus = kogus + ' HIVE';
  if(args[0] === 'hbd') kogus = kogus + ' HBD';
  let op = [
  'transfer',
  {
    from: config.hiveacc,
    to: args[2],
    amount: kogus,
    memo: ''
  }
]
  addtoqueue(op, true);
  return;
}


module.exports = {
  verifyargs
}