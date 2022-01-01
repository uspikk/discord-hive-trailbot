const SSC = require('sscjs');
const ssc = new SSC('https://api.hive-engine.com/rpc/');
const log = require('../discord/discord.js').log;
const config = require('../../config.js').accounts
const hive = require('@hiveio/hive-js');

function gettokenbals(offset){
  log('log', 'emptyvoter', 'attempting to get token balances');
  ssc.find('tokens','balances',{account:config.enginecuration},1000, offset, [], (err, result)=>{
    if(err){
      log('err', 'emptyvoter:gettokenbals', 'Error getting account balances');
      return;
    }
    if(result){
      let fulltx = [];
      for(var i=0;i<result.length;i++){
        if(JSON.parse(result[i].balance) > 0){
          let txbase = {
            "contractName": "tokens",
            "contractAction": "transfer",
            "contractPayload": {
              "symbol": result[i].symbol,
              "to": config.estoniatrail,
              "quantity": result[i].balance,
              "memo": ""
            }
          }
          fulltx.push(txbase);
          continue;
        }
      }
      if(fulltx.length === 0){
        log('log', 'emptyvoter', 'voter on tühi');
        return;
      }
      broadcast(fulltx)
      return;
    }
  });
}


function broadcast(tx){
  let wholetx = [
    "custom_json",
    {
      "required_auths": [config.enginecuration],
      "required_posting_auths": [],
      "id": "ssc-mainnet-hive",//ssc-mainnet-hive  ssc-mainnet1
      "json": JSON.stringify(tx.splice(0, 60))
    }
  ]
  hive.broadcast.send({
    extensions: [],
    operations: [wholetx]}, [config.enginecurationactivewif], (err, result) => {console.log(err, result);
      if(err){log('err', 'emptyvoter:broadcast', JSON.stringify(err));/*setTimeout(addqueue, 3000, JSON.parse(wholetx[1].json));*/return;}
      if(result){
        log('log', 'emptyvoter:broadcast', JSON.stringify(result.operations[0][0] + ' + ' + JSON.parse(result.operations[0][1].json).length + ' Ops'));
        //setTimeout(broadcast, 3000);
        return;
      }
  });
}

module.exports = {
  gettokenbals
}