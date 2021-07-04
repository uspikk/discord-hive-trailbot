const hive = require('@hiveio/hive-js');
const log = require('../discord/discord.js').log
const config = require('../../config.js').accounts

var votesystem = new enginemainclass();

function enginemainclass(){
  this.voteweed = 0;
  this.votestem = 0;
  this.voteleo = 0;
  this.votepal = 0;
  this.votesplinter = 0;
  this.votebattle = 0;
  this.voteneoxian = 0;
}

function addvotes(ammount, token){
  if(token === 'weed') votesystem.voteweed = ammount;
  if(token === 'stem') votesystem.votestem = ammount;
  if(token === 'leo') votesystem.voteleo = ammount;
  if(token === 'pal') votesystem.votepal = ammount;
  if(token === 'spt') votesystem.votesplinter = ammount;
  if(token === 'battle') votesystem.votebattle = ammount;
  if(token === 'neoxian') votesystem.voteneoxian = ammount;
  if(!token){
    votesystem.voteweed = ammount;
    votesystem.votestem = ammount;
    votesystem.voteleo = ammount;
    votesystem.votepal = ammount;
    votesystem.votesplinter = ammount;
    votesystem.votebattle = ammount;
    votesystem.voteneoxian = ammount;
  }
  log('log', 'addvotes', 'Vote add was successful')
}

function votestatus(){
  log('log', 'enginetrailsystem.votestatus', JSON.stringify(votesystem))
}

function recievevotes(ops){
  if(ops[1].json_metadata) ops[1].json_metadata = JSON.parse(ops[1].json_metadata);
  if(!ops[1].parent_author && ops[1].json_metadata.tags){
    for(var i=0;i<ops[1].json_metadata.tags.length;i++){
      let tag = ops[1].json_metadata.tags[i]
      if(tag === 'weedcash' || tag === 'weed' || tag === 'cannabis' || tag === 'psilocybin' || tag === 'dmt'){
        if(votesystem.voteweed > 0){
          votesystem.voteweed--;
          setTimeout(checkvoters, 30000, ops);
        }
        return;
      }
      if(tag === 'stem' && votesystem.votestem > 0){
        votesystem.votestem--;
        setTimeout(checkvoters, 30000, ops);
        return;
      }
      if(tag === 'palnet' && votesystem.votepal > 0){
        votesystem.votepal--;
        setTimeout(checkvoters, 30000, ops);
        return;
      }
      if(tag === 'spt' && votesystem.votesplinter > 0){
        votesystem.votesplinter--;
        setTimeout(checkvoters, 30000, ops);
        return;
      }
      if(tag === 'leo' && votesystem.voteleo > 0){
        votesystem.voteleo--;
        setTimeout(checkvoters, 30000, ops);
        return;
      }
      if(tag === 'battle' && votesystem.votebattle > 0){
        votesystem.votebattle--;
        setTimeout(checkvoters, 30000, ops);
        return;
      }
      if(tag === 'neoxian' && votesystem.voteneoxian > 0){
        votesystem.voteneoxian--;
        setTimeout(checkvoters, 30000, ops);
        return;
      }
    }
    /*
    const foundweed = ops[1].json_metadata.tags.find(element => element === 'weedcash').catch(err =>{log('err', 'enginetrail.recievevotes', JSON.stringify(err))});
    if(foundweed && votesystem.voteweed > 0){

    }
    const foundstem = ops[1].json_metadata.tags.find(element => element === 'stem');
    if(foundstem && votesystem.votestem > 0){

    }
    const foundleo = ops[1].json_metadata.tags.find(element => element === 'leo');
    if(foundleo && votesystem.voteleo > 0){

    }
    const foundpal = ops[1].json_metadata.tags.find(element => element === 'palnet');
    if(foundpal && votesystem.votepal > 0){

    }
    const foundsplinter = ops[1].json_metadata.tags.find(element => element === 'spt');
    if(foundsplinter && votesystem.votesplinter > 0){

    }
    const foundbattle = ops[1].json_metadata.tags.find(element => element === 'battle');
    if(foundbattle && votesystem.votebattle > 0){

    }
    const foundneoxian = ops[1].json_metadata.tags.find(element => element === 'neoxian');
    if(foundneoxian && votesystem.voteneoxian > 0){

    }*/
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
        log('err', 'broadcast:hiveengine', 'Unknown error');
        return;
      }
      if(result){
        log('log', 'broadcast:hiveengine', JSON.stringify(result.operations));
        return;
      }
  });
}



module.exports = {
  recievevotes,
  addvotes,
  votestatus
}