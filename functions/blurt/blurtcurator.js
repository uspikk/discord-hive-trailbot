const blurt = require('@blurtfoundation/blurtjs');
const fs = require('fs');
const config = require('../../config.js').accounts
const log = require('../discord/discord.js').log

let data;

function datahead(){
  blurt.api.setOptions({ url: 'https://rpc.blurt.world', useAppbaseApi: true });
  blurt.config.set('address_prefix','BLT');
  blurt.config.set('chain_id','cd8d90f29ae273abec3eaa7731e25934c63eb654d55080caff2ebb7f5df6381f');
  blurt.config.set('alternative_api_endpoints', ['https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world','https://rpc.blurt.world', 'https://rpc.blurt.world']);
  this.irrevercible = 0;
  this.nextCheck = 0;
  this.vests = 0;
  this.delegated = 0;
  this.reward = 0;
  this.save = true;
  this.headInterval;
}

function start(){
 data = new datahead();
 loaddata();
 return;
}

async function loaddata(){
  if(data.save){
    await fs.readFile(__dirname + '/../../data/blurthead.json', "utf8", (err, item) => {
      if (err) throw err;
      item = JSON.parse(item)
      data.nextCheck = item.nextCheck;
      data.irrevercible = item.irrevercible
      data.reward = item.reward;
      loadvests();
    });
  }
}

async function loadvests(){
  await blurt.api.getAccounts([config.blurt], function(err, result) {
    if(err && !result){
      log('err', 'blurtcurator:loadvests', JSON.stringify(err));
      return;
    }
    data.vests = parseFloat(result[0].vesting_shares);
    data.delegated = parseFloat(result[0].received_vesting_shares)
    data.headInterval = setInterval(updateblock, 10000);
    getblock();
  });
}

async function savestate(){
  if(data.save){
    let saveobj = {
      'irrevercible':data.irrevercible,
      'nextCheck':data.nextCheck,
      'reward':data.reward
    }
    await fs.writeFile(__dirname + '/../../data/blurthead.json', JSON.stringify(saveobj), function (err) {
      if (err) throw err;
    });
  }
}

function updateblock(){
  blurt.api.getDynamicGlobalProperties(function(err, result) {
    if(err){
      log('err', 'blurtcurator:updateblock', JSON.stringify(err));
      return;
    }
    if(result){
      data.irrevercible = result.head_block_number - 20;
      savestate()
      return;
    }
  });
}

function getblock(){
  if(data.nextCheck === data.irrevercible){
    setTimeout(getblock, 5000);
    return;
  }
  blurt.api.getOpsInBlock(data.nextCheck, true, function(err, result){///need to test empty blocks
    if(err){
      log('err', 'blurtcurator:getblock', JSON.stringify(err));
      setTimeout(getblock, 5000);
      return;
    }
    if(result){
      filterreward(result)
      data.nextCheck++
      getblock();
    }
  });
}

function filterreward(ops){
  for(var i = 0;i<ops.length;i++){
    if(ops[i].op[0] === 'curation_reward'){
      if(ops[i].op[1].curator === config.blurt){
        data.reward = data.reward + parseFloat(ops[i].op[1].reward);
      }
    }
  }
}

function calculaterewards(){
  blurt.api.getDynamicGlobalProperties(function(err, result) {
    if(err && !result){
      log('err', 'blurtcurator:calculaterewards', JSON.stringify(err));
      return;

    }
    let myvests = (parseFloat(result.total_vesting_fund_blurt) * data.vests)/parseFloat(result.total_vesting_shares);
    let delegatedvests = (parseFloat(result.total_vesting_fund_blurt) * data.delegated)/parseFloat(result.total_vesting_shares);
    let rewardvests = (parseFloat(result.total_vesting_fund_blurt) * data.reward)/parseFloat(result.total_vesting_shares);
    let totalblurt = myvests+delegatedvests;
    let sharePrec = 100*delegatedvests/totalblurt;
    let rewardshare = rewardvests*sharePrec/100;
    log('log', 'calculaterewards', `Total blurt: ${totalblurt.toFixed(3)} BLURT\nDelegated blurt: ${delegatedvests.toFixed(3)} BLURT\nDelegated %: ${sharePrec.toFixed(2)}\nTotal reward: ${rewardvests.toFixed(3)} BLURT\nDelegate reward: ${rewardshare.toFixed(3)} BLURT`)
  });
}


function stop(){

}

function stopsave(){
  console.log('Stopped blurt saving');
  data.save = false;
  return;
}

module.exports = {
  start,
  stopsave,
  calculaterewards
}