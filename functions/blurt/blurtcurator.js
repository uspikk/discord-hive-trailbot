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
  this.vests = 0;
  this.delegated = 0;
  this.reward = 0;
  this.unclaimedblurt = 0;
  this.unclaimedvests = 0;
  this.delegatereward = 0;
  this.save = true
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
      data.reward = item.reward;
      loadvests(1);
    });
  }
}

function loadvests(option){
  blurt.api.getAccounts([config.blurt], function(err, result) {
    if(err){
      log('err', 'blurtcurator:loadvests', JSON.stringify(err));
      return;
    }
    if(result){
      console.log(result)
      data.unclaimedvests = result[0].reward_vesting_balance;
      data.unclaimedblurt = result[0].reward_vesting_blurt;
      data.vests = parseFloat(result[0].vesting_shares);
      data.delegated = parseFloat(result[0].received_vesting_shares)
      if(option){
        calculaterewards(data);
      }
    }
  });
}

async function saveunclaimed(){
  let saveobj = {
    'reward':data.unclaimedblurt
  }
  await fs.writeFile(__dirname + '/../../data/blurthead.json', JSON.stringify(saveobj), function (err) {
    if (err) throw err;
  });
  //claimrewards();
}

function calculaterewards(){
  blurt.api.getDynamicGlobalProperties(function(err, result) {
    if(err && !result){
      log('err', 'blurtcurator:calculaterewards', JSON.stringify(err));
      return;

    }

  });
}

function claimrewards(){
  console.log(data.unclaimedblurt, data.unclaimedvests)
  blurt.broadcast.claimRewardBalance(
    config.blurtwif, config.blurt, `0.000 BLURT`, `${data.unclaimedvests}`,
      function(err, result) {
        console.log(err, result);
    }
  );

}



function sendblurt(){
  blurt.broadcast.transfer(config.blurtactive, config.blurt, 'cosmosdrop', '10870.141 BLURT', 'memo', function(err, result) {
    console.log(err, result);
  });
}
//10870.145
/*
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
*/
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


function calculaterewards(){
  blurt.api.getDynamicGlobalProperties(function(err, result) {
    if(err && !result){
      log('err', 'blurtcurator:calculaterewards', JSON.stringify(err));
      return;

    }
    //let myvests = (parseFloat(result.total_vesting_fund_blurt) * data.vests)/parseFloat(result.total_vesting_shares);
    let myvests = data.vests;
    console.log(data.unclaimedblurt)
    let delegatedvests = parseFloat(data.delegated);
    let rewardvests = parseFloat(data.unclaimedblurt);
    let totalblurt = myvests+delegatedvests;
    let sharePrec = 100*delegatedvests/totalblurt;
    data.delegatereward = data.unclaimedvests*sharePrec/100;
    log('log', 'calculaterewards', `Total vests: ${totalblurt.toFixed(3)} VESTS\nDelegated vests: ${delegatedvests.toFixed(3)} VESTS\nDelegated %: ${sharePrec.toFixed(2)}\nTotal reward: ${rewardvests.toFixed(3)} BLURT\nDelegate reward: ${data.delegatereward.toFixed(3)} BLURT`)
    //sendblurt();   works 
    //claimrewards(); works
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