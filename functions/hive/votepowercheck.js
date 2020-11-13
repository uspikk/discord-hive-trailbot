const hive = require('@hiveio/hive-js');
const log = require('../discord/discord.js').log

var db = new vpcheckclass();

function vpcheckclass(){
  this.users = [];
  this.values = [];  
  this.rewardfund = {};
  this.feedhistory = {};
}

function startvpcheck(args){
  db.users = args
  getrewardfund();
}

function getrewardfund(){
  hive.api.getRewardFund('post', function(err, result) {
    if(err || !result){
      if(!result && !err) err = 'Noresult';
      log('err', 'getrewardfund', JSON.stringify(err));
      return;
    }
    if(result){
      db.rewardfund = result
      getfeedhistory();
      return;
    }
  });
}

function getfeedhistory(){
  hive.api.getFeedHistory(function(err, result){
    if(err || !result){
      if(!err && !result) err = 'Noresult';
      log('err', 'getfeedhistory', JSON.stringify(err));
      return;
    }
    if(result){
      db.feedhistory = result;
      getusers();
      return;
    }
  })
}

function getusers(){
  hive.api.getAccounts(db.users, function(err, result) {
    if(err || !result){
      log('err', 'getuser', JSON.stringify(err));
      return;
    }
    if(result){
      if(result.length !== db.users.length){
        let mitmus = ''
        if(result.length > 1 && result.length === 0) mitmus = 't'
        log('err', 'getuser', `Moodul leidis ainult ${result.length} kasutaja${mitmus}`);
        return;
      }
      else{
        db.values = result;
        calculatevotevalues();
        return;
      }
    }
  });
}

function calculatevotevalues(){
  let message =''
  for(var i=0;i<db.values.length;i++){
    message=message+'Kasutaja: ' + db.values[i].name + '\n'
    const total_vests = parseFloat(db.values[i].vesting_shares) + parseFloat(db.values[i].received_vesting_shares) - parseFloat(db.values[i].delegated_vesting_shares);
    const final_vest = parseFloat(total_vests) * 1e6
    const power = (db.values[i].voting_power * 10000 / 10000) / 50
    const rshares = power * final_vest / 10000
    const estimate = rshares / parseFloat(db.rewardfund.recent_claims) * parseFloat(db.rewardfund.reward_balance) * parseFloat(db.feedhistory.current_median_history.base);
    message = message + '💲: ' + estimate.toFixed(3) +'\n'

    let account = db.values[i];
    const totalShares = parseFloat(account.vesting_shares) + parseFloat(account.received_vesting_shares) - parseFloat(account.delegated_vesting_shares) - parseFloat(account.vesting_withdraw_rate);
    const elapsed = Math.floor(Date.now() / 1000) - account.voting_manabar.last_update_time;
    const maxMana = totalShares * 1000000;
    let currentMana = parseFloat(account.voting_manabar.current_mana) + elapsed * maxMana / 432000;
      if(currentMana > maxMana){
        currentMana = maxMana;
      }
    const currentManaPerc = currentMana * 100 / maxMana;
    message = message + '%: ' + currentManaPerc.toFixed(3) + '\n'

    let calculatefulltime = currentManaPerc/100;
    calculatefulltime = calculatefulltime*5;
    calculatefulltime = 5 - calculatefulltime;
    const decimal = calculatefulltime - Math.floor(calculatefulltime);
    calculatefulltime = calculatefulltime - decimal;
    const hours = Math.floor(24 * decimal)

    if(currentManaPerc === 100)calculatefulltime = 0
    let mitmus = ''
    let mitmus2 = ''
    if(calculatefulltime > 1) mitmus = 'a';
    if(hours > 1) mitmus2 = 'i';
    message = message + '⌛: ' + calculatefulltime + ` päev${mitmus} ` + `${hours} Tund${mitmus2}` + '\n\n'
  }
  log('log', 'calculatevotevalues', message);
  db = new vpcheckclass();
  return;
}





module.exports = {
  startvpcheck
}