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
  const sendcomment = require('./autovoteifhighvp.js').storecomments
  if(listclass === null) {
    listclass = new followbooter();
    return;
  }

    for(var i=0;i<listclass.followlist.length;i++){
      if(op[1].author === listclass.followlist[i] && op[1].author !== config.estoniatrail){
        if(!op[1].parent_author){
          setTimeout(checkforvotes, 300000, op);
          return;
        }
        if(op[1].parent_author){
          /// build out only comments to estonia
          sendcomment(op);
          return;
        }
      }
    }
    return;
  
}


function checkforvotes(op){
  const author = op[1].author;
  const permlink = op[1].permlink;
  hive.api.getActiveVotes(author, permlink, function(err, result) {
    if(result){
      for(var i=0;i<result.length;i++){
        if(result[i].voter === 'voter' || result[i].voter === 'nrg'){
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

module.exports = {
  processcomments
}

