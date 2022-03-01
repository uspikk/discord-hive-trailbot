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
  this.liquidblurt = 0;
  this.delegated = 0;
  this.reward = 0;
  this.unclaimedblurt = 0;
  this.unclaimedvests = 0;
  this.delegatereward = 0;
  this.save = true
}

function start(option){
 data = new datahead();
 loadvests(option);
 return;
}


function loadvests(option){
  blurt.api.getAccounts([config.blurt], function(err, result) {
    if(err){
      log('err', 'blurtcurator:loadvests', JSON.stringify(err));
      return;
    }
    if(result){
      data.liquidblurt = result[0].balance;
      data.unclaimedvests = result[0].reward_vesting_balance;
      data.unclaimedblurt = result[0].reward_vesting_blurt;
      data.vests = parseFloat(result[0].vesting_shares);
      data.delegated = parseFloat(result[0].received_vesting_shares)
        calculaterewards(option);
    }
  });
}


function claimrewards(sharereward, sharePrec){
  if(parseFloat(data.liquidblurt) > parseFloat(sharereward)){
    blurt.broadcast.claimRewardBalance(
      config.blurtwif, config.blurt, `0.000 BLURT`, `${data.unclaimedvests}`,
        function(err, result) {
          if(result){
            log('log', 'blurtcurator:claimrewards', `Successfully claimed ${data.unclaimedblurt}`);
            sendblurt(sharePrec);
            return;
          }
          if(err){
            log('err', 'claimrewards', JSON.stringify(err));
            return;
          }
      }
    );
  }
  else{
    log('err', 'blurtcurator:claimrewards', 'Not enough liquid blurt');
    return;
  }
}



function sendblurt(sharePrec){
  blurt.broadcast.transfer(config.blurtactive, config.blurt, 'kentzz001', `${data.delegatereward} BLURT`, `Total claimed:${data.unclaimedblurt}, Share precent:${sharePrec}`, function(err, result) {
    if(result){
      log('log', 'sendblurt', `Successfully sent ${data.delegatereward} BLURT`);
      return
    }
    if(err){
      log('err', 'sendblurt', JSON.stringify(err));
      return;
    }
  });
}


function calculaterewards(option){
  blurt.api.getDynamicGlobalProperties(function(err, result) {

    if(err && !result){
      log('err', 'blurtcurator:calculaterewards', JSON.stringify(err));
      return;

    }
    let myvests = data.vests;
    let delegatedvests = parseFloat(data.delegated);
    let rewardvests = parseFloat(data.unclaimedblurt);
    let totalblurt = myvests+delegatedvests;
    let sharePrec = 100*delegatedvests/totalblurt;
    data.delegatereward = (parseFloat(data.unclaimedblurt)*sharePrec/100).toFixed(3)*1;
    log('log', 'calculaterewards', `Total vests: ${totalblurt.toFixed(3)} VESTS\nDelegated vests: ${delegatedvests.toFixed(3)} VESTS\nDelegated %: ${sharePrec.toFixed(2)}\nTotal reward: ${rewardvests.toFixed(3)} BLURT\nDelegate reward: ${data.delegatereward.toFixed(3)} BLURT`)
    if(option){
      claimrewards(data.delegatereward, sharePrec);
    }
  });
}


function kentzzrewards(option){
  return new Promise(function(resolve, reject){
    blurt.api.getDynamicGlobalProperties(function(err, result) {
      if(err && !result){
        resolve(JSON.stringify(err));
        return;
      }
      let myvests = data.vests;
      let delegatedvests = parseFloat(data.delegated);
      let rewardvests = parseFloat(data.unclaimedblurt);
      let totalblurt = myvests+delegatedvests;
      let sharePrec = 100*delegatedvests/totalblurt;
      data.delegatereward = (parseFloat(data.unclaimedblurt)*sharePrec/100).toFixed(3)*1;
      if(!option)resolve(`Total vests: ${totalblurt.toFixed(3)} VESTS\nDelegated vests: ${delegatedvests.toFixed(3)} VESTS\nDelegated %: ${sharePrec.toFixed(2)}\nTotal reward: ${rewardvests.toFixed(3)} BLURT\nDelegate reward: ${data.delegatereward.toFixed(3)} BLURT`);
      if(option){
        kentzzclaim(data.delegatereward, sharePrec);
        return;
      }
    });
  });
}


function kentzzclaim(sharereward, sharePrec){
  return new Promise(function(resolve, reject){
    if(parseFloat(data.liquidblurt) > parseFloat(sharereward)){
      blurt.broadcast.claimRewardBalance(
        config.blurtwif, config.blurt, `0.000 BLURT`, `${data.unclaimedvests}`,
          function(err, result) {
            if(result){
              kentzzsend(sharePrec);
              return;
            }
            if(err){
              resolve(JSON.stringify(err));
              return;
            }
        }
      );
    }
    else{
      resolve('Not enough liquid blurt');
      return;
    }
  });
}



function kentzzsend(sharePrec){
  return new Promise(function(resolve, reject){
    blurt.broadcast.transfer(config.blurtactive, config.blurt, 'kentzz001', `${data.delegatereward} BLURT`, `Total claimed:${data.unclaimedblurt}, Share precent:${sharePrec}`, function(err, result) {
      if(result){
        resolve(`Successfully sent ${data.delegatereward} BLURT`);
        return
      }
      if(err){
        resolve(JSON.stringify(err));
        return;
      }
    });
  });
}



module.exports = {
  start,
  loadvests,
  calculaterewards,
  kentzzrewards
}