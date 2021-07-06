var blurt = require('@blurtfoundation/blurtjs');
var blurtvoter;
const log = require('../discord/discord.js').log



function blurtclass(){
  blurt.api.setOptions({ url: 'https://rpc.blurt.world', useAppbaseApi: true });
  blurt.config.set('address_prefix','BLT');
  blurt.config.set('chain_id','cd8d90f29ae273abec3eaa7731e25934c63eb654d55080caff2ebb7f5df6381f');
  blurt.config.set('alternative_api_endpoints', ['https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world']);

  this.block = 0;
  this.errcount = 0;
  this.followlist = [];
  this.getlatestblock();

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
      blurtvoter.getblock(result.head_block_number);
      
      let startFollowing;
      let followType;
      let limit = 1000;
      blurt.api.getFollowing(acc, startFollowing, followType, limit, function(err, result) {
       if(result){
        for(var i=0;i<result.length;i++){
          blurtvoter.followlist.push(result[i].following);
        }
       }
      });
    }
  });
}

blurtclass.prototype.getblock = function(blockNum){
  if(blurtvoter.errcount > 10){
    log('err', 'blurtclass.getblock', 'Stopping scanner, too many errors');
    blurtvoter = false;
    return;
  }
  const getblock = blurtvoter.getblock;
  const blockfilter = blurtvoter.blockfilter;
  blurt.api.getBlock(blockNum, function(err, result) {
    if(err) {
     // log('err', 'blurtclass.getblock', 'Error getting latest block');
      blurtvoter.errcount++;
      setTimeout(getblock, 2000, blockNum);
      return;
    }
    if(result){
      blurtvoter.block = blockNum;
      blurtvoter.errcount = 0;
      blockfilter(result.transactions, blockNum);
      return;
    };
    if(!err && !result){
      setTimeout(getblock, 2000, blockNum);
      return;
    }
  });
}
/*
[
  'comment',
  {
    parent_author: 'sarimanok',
    parent_permlink: 'celebrating-our-noche-buena',
    author: 'fycee',
    permlink: 'qlzxdn',
    title: '',
    body: "We haven't prepared that much because we were so lazy doing so. I just slept all day and all night during the celebration. Because I was so pressured and having lack of sleep the whole week.",
    json_metadata: '{"tags":["blurtwomen"],"app":"blurt/0.1"}'
  }
]
*/

/*
[
  "vote",
  {
    "voter": "hiveio",
    "author": "alice",
    "permlink": "a-post-by-alice",
    "weight": 10000
  }
]
*/

blurtclass.prototype.blockfilter = function(ops, blockNum){
  const broadcastvote = blurtvoter.broadcastvote;
  const getblock = blurtvoter.getblock;
  for(var i=0;i<ops.length;i++){
    for(var j=0;j<ops[i].operations.length;j++){
      op = ops[i].operations[j];
      if(op[0] === 'comment' && op[1].parent_author === ''){
        const foundauthor = blurtvoter.followlist.find(element => element === op[1].author);
        if(foundauthor){
          let newOp = [
            'vote',
            {
              'voter':acc,
              'author':op[1].author,
              'permlink':op[1].permlink,
              'weight':10000
            }
          ]
          setTimeout(broadcastvote, 30000, newOp);
        }
      }
      if(op[0] === 'comment' && op[1].parent_author !== ''){
        const foundauthor = blurtvoter.followlist.find(element => element === op[1].author);
        if(foundauthor){
          let vote1 = [
          'vote',
          {
            'voter':acc,
            'author':op[1].parent_author,
            'permlink':op[1].parent_permlink,
            'weight':10000
          }
          ]
          broadcastvote(vote1);
          let vote2 = [
          'vote',
            {
              'voter':acc,
              'author':op[1].author,
              'permlink':op[1].permlink,
              'weight':10000
            }
          ]
          setTimeout(broadcastvote, 30000, vote2)
        }
      }
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
  blurtvoter = false;
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