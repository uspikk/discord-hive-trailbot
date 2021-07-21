const hive = require('@hiveio/hive-js');
const SSC = require('sscjs');
const config = require('../../config.js').accounts
const log = require('../discord/discord.js').log


const axios = require('axios');
let day = require("dayjs")
let utc = require('dayjs/plugin/utc')
day.extend(utc)


const ssc = new SSC('https://api.hive-engine.com/rpc/');
let data;

function localstorage(){
  this.tokens = [];
  this.vptreshold = 85;
}

function bootfile(){
  data = new localstorage();
  ssc.find('tokens','balances',{account:config.enginecuration},1000, 0, [], (err, result)=>{
    if(err){
      log('err', 'voterv2:bootfile', 'Error getting account balances');
      return;
    }
    if(result){
      for(var i=0;i<result.length;i++){
        let tokenstat = {
          'symbol':result[i].symbol,
          'stake':parseFloat(result[i].stake) + parseFloat(result[i].delegationsIn),
          'tags':[],
          'exclude_tags':[],
          'vp':0
        }
        if(tokenstat.stake > 0){
          data.tokens.push(tokenstat);
        }
      }
      gettags(0);
      return;
    }
  });
}

function gettags(step){
  if(step===data.tokens.length){
    getvps();
    return;
  }
  axios(`https://scot-api.steem-engine.net/config?token=${data.tokens[step].symbol}`).then((result) => {
    data.tokens[step].tags = result.data.json_metadata_value.split(',');
    if(result.data.exclude_tags) data.tokens[step].exclude_tags = result.data.exclude_tags.split(',');
    step++;
    gettags(step);
    return;
  });
}

function getvps(){
  let now = day.utc().unix()
  axios(`https://scot-api.steem-engine.net/@${config.enginecuration}?hive=1`).then((result) => {
    for(i=0;i<data.tokens.length;i++){
      let vp = parseInt(result.data[data.tokens[i].symbol].voting_power) / 100;
      let lastvote = day.utc(result.data[data.tokens[i].symbol].last_vote_time).unix();
      let diff = now - lastvote;
      data.tokens[i].vp = vp + (0.00023148148 * diff);
    }
  });
}

function recievevotes(ops){
  if(ops[1].json_metadata) ops[1].json_metadata = JSON.parse(ops[1].json_metadata);
  if(!ops[1].parent_author && ops[1].json_metadata.tags){
    for(var i=0;i<data.tokens.length;i++){
      if(data.tokens[i].vp > data.vptreshold){
        for(var j=0;j<ops[1].json_metadata.tags.length;j++){
          for(var x=0;x<data.tokens[i].tags.length;x++){
            if(data.tokens[i].tags[x] === ops[1].json_metadata.tags[j]){
              setTimeout(checkvoters, 30000, ops);
            }
          }
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
        let operation = ['vote', {
          "voter": config.enginecuration,
          "author": ops[1].author,
          "permlink": ops[1].permlink,
          "weight": 10000
        }]
        setTimeout(broadcastvote, 300000, operation);
        return;
      }
    }
  });
}



function broadcastvote(tx){
  hive.broadcast.send({
      extensions: [],
      operations: [tx]},
    [config.enginecurationwif], (err, result) => {
      if(err){
        log('err', 'broadcast:hiveengine', 'Unknown error');
        return;
      }
      if(result){
        log('log', 'broadcast:hiveengine', JSON.stringify(result.operations));
        gettags();
        return;
      }
  });
}
 
module.exports = {
	bootfile,
  recievevotes
}
/*
 check what tokens user has
 check all tags for those tokens
 get vote power % for those tokens
 vote for those tokens


 double vote check

*/