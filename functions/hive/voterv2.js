const hive = require('@hiveio/hive-js');
const SSC = require('sscjs');
const config = require('../../config.js').accounts
const log = require('../discord/discord.js').log


const axios = require('axios');
let day = require("dayjs")
let utc = require('dayjs/plugin/utc')
day.extend(utc)


//const ssc = new SSC('https://api2.hive-engine.com/rpc/');
const ssc = new SSC('https://engine.deathwing.me');
let data;

function localstorage(){
  this.tokens = [];
  this.vptreshold = 85;
  this.permavote = ['splinterlands', 'clove71', 'stever82', 'rentmoney', 'costanza', 'apprentice001', 'mawit07', 'taskmaster4450', 'lbi-token', 'edicted', 'abh12345', 'dalz', 'ashikstd', 'peakmonsters', 'jacekw', 'azircon', 'revisesociology']
  this.running = true;
}

function bootfile(){
  data = new localstorage();
  ssc.find('tokens','balances',{account:config.enginecuration},1000, 0, [], (err, result)=>{
    if(err){
      log('err', 'voterv2:bootfile', `${JSON.stringify(err)}Error getting account balances Timeout:15000`);
      return;
    }
    if(result){
      for(var i=0;i<result.length;i++){
        let tokenstat = {
          'symbol':result[i].symbol,
          'stake':parseFloat(result[i].stake) + parseFloat(result[i].delegationsIn),
          'tags':[],
          'exclude_tags':[],
          'vp':0,
          'comment':false,
          'poolid':null,
          'voteregendays':null
        }
        if(tokenstat.stake > 0){
          data.tokens.push(tokenstat);
        }
      }
      setTimeout(checkComment, 60000)
      return;
    }
  });
}

function checkComment(){
  ssc.find('comments', 'rewardPools', {"active":true}, 1000, 0,[], (err, result)=>{
    if(err){
      log('err', 'voterv2:checkComment', 'Error checking comment Timeout:15000');
      return;
    }
    if(result){
      for(var i=0;i<result.length;i++){
        for(var j=0;j<data.tokens.length;j++){
          if(result[i].symbol === data.tokens[j].symbol){
            data.tokens[j].comment = true;
            data.tokens[j].poolid = result[i]._id;
            data.tokens[j].voteregendays = result[i].config.voteRegenerationDays
          }
        }
      }
    }
    setTimeout(findcommentvp, 60000);
    return;
  })
}

function findcommentvp(){
  ssc.find('comments', 'votingPower', {"account":`${config.enginecuration}`}, 1000, 0, [], (err, result)=>{
    if(err){
      log('err', 'voterv2:findcommentvp', 'Error finding comment vp Timeout:15000');
      
      return;
    }
    if(result){
      for(var i=0;i<result.length;i++){
        for(var j=0;j<data.tokens.length;j++){
          if(result[i].rewardPoolId === data.tokens[j].poolid){
            let now = Date.now();
            let vp = result[i].votingPower / 100;
            let lastvote = result[i].lastVoteTimestamp
            let diff = now - lastvote;
            data.tokens[j].vp = vp + ((100/(86400*1000*data.tokens[j].voteregendays)) * diff);
          }
        }
      }
      gettags(0)
    }
  })
}

function gettags(step){
  if(step===data.tokens.length){
    getvps();
    return;
  }
  if(!data.tokens[step].symbol){
    console.log('voterv2 gettags stepper fault');
    gettags(step);
    return;
  }
  axios(`https://scot-api.steem-engine.net/config?token=${data.tokens[step].symbol}`).then((result) => {
    data.tokens[step].tags = result.data.json_metadata_value.split(',');
    if(result.data.exclude_tags) data.tokens[step].exclude_tags = result.data.exclude_tags.split(',');
    step++;
    gettags(step);
  });
}

function getvps(){
  let now = day.utc().unix()
  axios(`https://scot-api.steem-engine.net/@${config.enginecuration}?hive=1`).then((result) => {
    for(i=0;i<data.tokens.length;i++){
      if(data.tokens[i].comment) continue;
      let vp = parseInt(result.data[data.tokens[i].symbol].voting_power) / 100;
      let lastvote = day.utc(result.data[data.tokens[i].symbol].last_vote_time).unix();
      let diff = now - lastvote;
      data.tokens[i].vp = vp + (0.00023148148 * diff);
    }
  });
}

function displayvps(){
  let logmessage = ``
  for(var i = 0;i<data.tokens.length;i++){
    logmessage = logmessage + `${data.tokens[i].symbol}:\nStake:${data.tokens[i].stake}\nVp:${data.tokens[i].vp.toFixed(2)}%\n____\n`
  }
  log('log', 'displayvps', logmessage)
}

function recievevotes(ops){
  if(!data) return;
  if(ops[1].json_metadata) ops[1].json_metadata = JSON.parse(ops[1].json_metadata);
  if(!ops[1].parent_author && ops[1].json_metadata.tags){
    for(var i=0;i<data.tokens.length;i++){
      if(data.tokens[i].vp > data.vptreshold){
        for(var j=0;j<ops[1].json_metadata.tags.length;j++){
          for(var x=0;x<data.tokens[i].tags.length;x++){
            if(data.tokens[i].tags[x] === ops[1].json_metadata.tags[j]){
              setTimeout(checkvoters, 3000, ops);
              return;
            }
          }
        }
      }
    }
    if(!ops[1].parent_author){
      for(var i=0;i<data.permavote.length;i++){
        if(ops[1].author === data.permavote[i]){
          setTimeout(checkvoters, 3000, ops)
          return;
        }
      }
    }
  }
}

function checkvoters(ops){
  hive.api.getActiveVotes(ops[1].author, ops[1].permlink, function(err, result) {
    if(err){
      buildvote(ops);
      return;
    }
    if(result){
      if(result.length === 0){
        buildvote(ops);
        return;
      }
      else{
        for(var i=0;i<result.length;i++){
          if(result[i].voter === config.enginecuration){
            return;
          }
        }
        buildvote(ops);
        return;
      }
    }
  });
}

function buildvote(ops){
  let operation = ['vote', {
    "voter": config.enginecuration,
    "author": ops[1].author,
    "permlink": ops[1].permlink,
    "weight": 10000
  }]
  setTimeout(broadcastvote, 300000, operation);
  return;
}



function broadcastvote(tx){
  hive.broadcast.send({
      extensions: [],
      operations: [tx]},
    [config.enginecurationwif], (err, result) => {
      if(err){
        log('err', 'broadcast:voterv2', 'Unknown error');
        return;
      }
      if(result){
        log('log', 'broadcast:voterv2', JSON.stringify(result.operations));
        return;
      }
  });
}
 
module.exports = {
	bootfile,
  recievevotes,
  displayvps
}


/*
def engine_everything(contract, table, query, offset):
    url = 'https://api.hive-engine.com/rpc/contracts'
    params = {'contract':contract, 'table':table, 'query':query, 'limit':1000, 'offset':offset, 'indexes':[]}
    j = {'jsonrpc':'2.0', 'id':1, 'method':'find', 'params':params}

    with requests.post(url, json=j) as r:
        data = r.json()
        result = data['result']
        if len(result) == 1000:
            result += engine_everything(contract, table, query, offset+1000)
    return result

engine_everything("tokens", "balances", {"account":"gerber", "symbol":"BEE"}, 0)
# engine_everything("market", "metrics", {"symbol":"BEE"}, 0)

*/