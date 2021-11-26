const SSC = require('sscjs');
const ssc = new SSC('https://api.hive-engine.com/rpc/');
const log = require('../discord/discord.js').log;
const acc = require('../../config.js').accounts.estoniatrail;
const wif = require('../../config.js').accounts.estoniatrailactivewif;
const hive = require('@hiveio/hive-js');

let data;

function database(){
  this.json = [];
}

function gettokenbals(offset){
  console.log('ere')
  if(offset === 0)data = new database();
  ssc.find('tokens','balances',{account:acc},1000, offset, [], (err, result)=>{
    if(err){
      log('err', 'reneworders:gettokenbals', JSON.stringify(err));
      return;
    }
    if(result){
      for(var i=0;i<result.length;i++){
        if(parseFloat(result[i].balance) !== 0){
          if(result[i].symbol === 'SWAP.HIVE') continue;
          data.json.push({
            "contractName" : "market",
            "contractAction" : "sell",
            "contractPayload" : {
              "symbol": result[i].symbol,
              "quantity": result[i].balance,
              "price": '0.00000001'
            }
          })
        }
      }
      broadcast()
    }
  })
}

function broadcast(){
  const wholetx = [
    "custom_json",
      {
        "required_auths": [acc],
        "required_posting_auths": [],
        "id": "ssc-mainnet-hive",//ssc-mainnet-hive  ssc-mainnet1
        "json": JSON.stringify(data.json)
      }
  ]
  console.log(wholetx)
  hive.broadcast.send({
    extensions: [],
    operations: [wholetx]}, [wif], (err, result) => {
      if(err){log('err', 'sellshit:broadcast', JSON.stringify(err));return;}
      if(result){
        log('log', 'sellshit:broadcast', JSON.stringify(result.operations[0][0] + ' + ' + JSON.parse(result.operations[0][1].json).length + ' Ops'));
        return;
      }
    }

  );
}

module.exports = {
  gettokenbals
}