let hive = require('@hiveio/hive-js');
let log = require('../discord/discord.js').log
const config = require('../../config.js').config
let pushtx = require('./broadcast.js').addtoqueue
const acclist = new accpank()

function accpank(){
  this.accounts = [];
}

function scanvotes(voteops){
  if(acclist.accounts.length === 0) return;
  for(var i=0;i<acclist.accounts.length;i++){
    if(acclist.accounts[i][1] === 0){
      let removedaccount = acclist.accounts.splice(i, 1);
      log('log', 'scanvotes', `${removedaccount[0]} Out of votes \n Removed from list`)
      return;
    }
    if(acclist.accounts[i][0] === voteops[1].voter){
      voteops[1].voter = config.hiveacc;
      if(acclist.accounts[i][1] !== 'inf') acclist.accounts[i][1]--;
      pushtx(voteops, false);
      return;
    }
  }
}

function adduser(args){
  hive.api.lookupAccountNames([args[0]], function(err, result) {
    if(err){
       log('err', 'adduser', JSON.stringify(err));
       return;
    }
    if(result[0] === null){
      log('err', 'adduser', 'noresult');
      return;
    }
    if(result){
      acclist.accounts.push([args[0], args[1]]);
      log('log', 'adduser', 'Kasutaja edukalt lisatud');
      return;
    }
  });
}

function cleartrail(){
  acclist.accounts = [];
  log('log', 'cleartrail', `acclist.accounts = ${JSON.stringify(acclist.accounts)}`);
  return;
}



module.exports = {
  scanvotes,
  adduser,
  cleartrail
}