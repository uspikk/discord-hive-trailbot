var blurt = require('@blurtfoundation/blurtjs');
var blurtvoter;
const log = require('../discord/discord.js').log



function blurtclass(){
  blurt.api.setOptions({ url: 'https://rpc.blurt.world', useAppbaseApi: true });
  blurt.config.set('address_prefix','BLT');
  blurt.config.set('chain_id','cd8d90f29ae273abec3eaa7731e25934c63eb654d55080caff2ebb7f5df6381f');
  blurt.config.set('alternative_api_endpoints', ['https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world']);

  this.block = 0
  this.getlatestblock()
}


const acc = require('../../config.js').accounts.blurt
const wif = require('../../config.js').accounts.blurtwif


blurtclass.prototype.getlatestblock = function (){
  blurt.api.getDynamicGlobalProperties(function(err, result) {
    if(err){
      log('err', 'blurtclass.getlatestblock', 'Error getting latest block number');
    }
    if(result){
      log('log', 'blurtclass.getlatestblock', 'successfully booted latest block');
      blurtvoter.getblock(result.head_block_number)
    }
  });
}

blurtclass.prototype.getblock = function(blockNum){
  const getblock = blurtvoter.getblock;
  const blockfilter = blurtvoter.blockfilter;
  blurt.api.getBlock(blockNum, function(err, result) {
    if(err) {
      log('err', 'blurtclass.getblock', 'Error getting latest block');
      setTimeout(getblock, 2000, blockNum);
      return;
    }
    if(result){
      blurtvoter.block = blockNum;
      blockfilter(result.transactions, blockNum);
      return;
    };
    if(!err && !result){
      setTimeout(getblock, 2000, blockNum);
      return;
    }
  });
}

blurtclass.prototype.blockfilter = function(ops, blockNum){
  const broadcastvote = blurtvoter.broadcastvote;
  const getblock = blurtvoter.getblock;
  for(var i=0;i<ops.length;i++){
    for(var j=0;j<ops[i].operations.length;j++){
      op = ops[i].operations[j];
      if(op[0]==='vote' && op[1].voter === 'blurtcurator'){
        op[1].voter = acc;
        broadcastvote(op);
      }
    }
  }
  blockNum++;
  getblock(blockNum);
}

blurtclass.prototype.broadcastvote = function(op){
  blurt.broadcast.send({
    extensions: [],
    operations: [op]}, [wif], (err, result) => {
      if(err){
        log('err', 'blurtclass.broadcast', JSON.stringify(err));
        return;
      }
    log('log', 'blurtclass.broadcastvote', JSON.stringify(result.operations));
    return;
  });
}

function startvoter(){
  blurtvoter = new blurtclass();
}

function stopvoter(){
 blurtvoter = false
}

function exportblock(){
  return new Promise(function(resolve, reject){
    resolve(blurtvoter.block)
  })
}

module.exports = {
  startvoter,
  stopvoter,
  exportblock
}