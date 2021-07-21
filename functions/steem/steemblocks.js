var steem = require('steem');
const log = require('../discord/discord.js').log
const config = require('../../config.js').accounts

let data;

function database(){
  this.block;
}

function start(){
  data = new database();
  steem.api.getDynamicGlobalProperties(function(err, result) {
    if(err){
    	start();
    	return;
    }
    if(result){
      data.block = result.head_block_number;
      getheadblock();
    }
  });
}

function getheadblock(){
	steem.api.getBlock(data.block, function(err, result) {
    if(err){
      setTimeout(getheadblock, 3000);
      return;
    }
	  if(result){
      blockfilter(result);
      return;
    }
	});
}


function blockfilter(block){
  for(var i=0;i<block.transactions.length;i++){
    for(var j=0;j<block.transactions[i].operations.length;j++){
      let op = block.transactions[i].operations[j]
      //console.log(op[0], op[1].voter)
      if(op[0] === 'vote' && op[1].voter === 'tipu'){
        console.log('tipu voter')
        upvote(op);
      }
    }
  }
  data.block++;
  getheadblock();
  return;
}

function upvote(op){
  op[1].voter = config.steem
  console.log(op)
    steem.broadcast.send({
    extensions: [],
    operations: [op]},
  [config.steemwif], (err, result) => {
    if(err){
      console.log(err)
      //log('err', `broadcast:steemblocks`, JSON.stringify(err));//.data.stack[0].format
      return;
    }
    if(result){
      console.log(result)
      //log('log', 'steemblocks:broadcast', JSON.stringify(result.operations));
      return;
    }
  });
}


module.exports = {
	start
}