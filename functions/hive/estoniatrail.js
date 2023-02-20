let hive = require('@hiveio/hive-js');
const log = require('../discord/discord.js').log
const config = require('../../config.js').accounts

function followbooter(){
  this.followlist = [];
  this.cooldown = [];
  this.getfollowlist();
}

followbooter.prototype.getfollowlist = function(){
  const follower = 'estonia';
  const startFollowing = '';
  const followType = '';
  const limit = 1000
  const updatefollow = this.updatefollowlist
  hive.api.getFollowing(follower, startFollowing, followType, limit, function(err, result) {
    if(err){
      log('err', 'estoniatrail.getfollowlist', JSON.stringify('err'));
      return;
    }
    if(result){
      let newfollowlist = []
      for(var i=0;i<result.length;i++){
        newfollowlist.push(result[i].following);
        continue;
      }
      updatefollow(newfollowlist);
      return;
    }
  });
}

followbooter.prototype.updatefollowlist = function(newlist){
  listclass.followlist = newlist;
}

let listclass = null;


function processcomments(op){
  if(listclass === null) {
    listclass = new followbooter();
    return;
  }
    for(var i=0;i<listclass.followlist.length;i++){
      if(op[1].author === listclass.followlist[i]){
        if(!op[1].parent_author){ ///kui teinud tavalise posti
          setTimeout(checkforvotes, 300000, op);
          return;
        }
        if(op[1].parent_author){  /// kui teinud commenti
          /// build out only comments to estonia/// revise - whatever that means
          setTimeout(checkforparentvotes, 300000, op);
          return;
        }
      }
    }
    return;
  
}

function checkforparentvotes(op){//not-vote-downvote system
  const sendcomment = require('./autovoteifhighvp.js').storecomments
  const author = op[1].parent_athor;
  const permlink = op[1].parent_permlink;
  if(author === 'ubg' || author === config.estoniatrail) return;
  hive.api.getActiveVotes(author, permlink, function(err, result) {
    if(result){
      for(var i=0;i<result.length;i++){
        for(var j=0;j<listclass.followlist.length;j++){
          if(result[i].voter === listclass.followlist[j] && result[i].rshares < 0) return;
        }
      }
      sendcomment(op);
    }
  })
}

function checkforvotes(op){
  const author = op[1].author;
  const permlink = op[1].permlink;
  hive.api.getActiveVotes(author, permlink, function(err, result) {
    if(result){
      for(var i=0;i<result.length;i++){
        if(result[i].voter === config.enginecuration || result[i].voter === config.estoniatrail){ //voter--nrg
          return;
        }
      }
      let operation =[['vote', {
          "voter": config.enginecuration,
          "author": author,
          "permlink": permlink,
          "weight": 10000
        }], ['vote', {
          "voter": config.estoniatrail,
          "author": author,
          "permlink": permlink,
          "weight": 10000
        }]]
      broadcastvote(operation);
      return;
    }
  });
}

function broadcastvote(tx){
  hive.broadcast.send({
      extensions: [],
      operations: tx},
    [config.enginecurationwif, config.estoniatrailwif], (err, result) => {
      if(err){
        log('err', `broadcastvote:estoniatrail`, JSON.stringify(err));
        return;
      }
      if(result){
        log('log', 'broadcastvote:estoniatrail', JSON.stringify(result.operations));
        return;
      }
  });
}

  
const exportfollowers = new Promise(function(resolve, reject){
  if(listclass.followlist.length > 0)resolve(listclass.followlist);
})

module.exports = {
  processcomments,
  exportfollowers
}

