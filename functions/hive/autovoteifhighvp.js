const hive = require('@hiveio/hive-js');
const log = require('../discord/discord.js').log;
const account = require('../../config.js').accounts.estoniatrail;
const wif = require('../../config.js').accounts.estoniatrailwif;
const notify = require('../discord/discord.js').notification


const auto = new autovotehighvp();

function autovotehighvp(){
  this.vp = null;
  this.intervalfunc;
  this.intervaltimer = 60000;
  this.manaPrec = 70;
  this.votePrec = 7500;
  this.notifyPrec = 99;
}//maybe pull this to config


autovotehighvp.prototype.testvp = function(post){
  hive.api.getAccounts([account], function(err, result) {
    if(err || !result){
      log('err', 'testvp', JSON.stringify(err));
      return;
    }
    if(result){
      let account = result[0];
      const totalShares = parseFloat(account.vesting_shares) + parseFloat(account.received_vesting_shares) - parseFloat(account.delegated_vesting_shares) - parseFloat(account.vesting_withdraw_rate);
      const elapsed = Math.floor(Date.now() / 1000) - account.voting_manabar.last_update_time;
      const maxMana = totalShares * 1000000;
      let currentMana = parseFloat(account.voting_manabar.current_mana) + elapsed * maxMana / 432000;
        if(currentMana > maxMana){
          currentMana = maxMana;
        }
      const currentManaPerc = currentMana * 100 / maxMana;
      if(currentManaPerc > auto.notifyPrec){
        notify(`@nrg hetkene vote poweri protsent on ${currentManaPerc.toFixed(2)}%`);
      }
      if(post){
        if(currentManaPerc > auto.manaPrec){
          console.log(post)
          let upops = [['vote', {
                "voter": account,
                "author": post[1].parent_author,
                "permlink": post[1].parent_permlink,
                "weight": auto.votePrec
              }], ['vote', {
                "voter": account,
                "author": post[1].author,
                "permlink": post[1].permlink,
                "weight": auto.votePrec
              }]]
          setTimeout(upvotepost, 300000, upops);
        }
      }
      if(!post){
        auto.vp = currentManaPerc;
      }
    }
  });
}


function storecomments(post){
 auto.testvp(post);
}

function startcheckingvp(){
  auto.intervalfunc = setInterval(auto.testvp, auto.intervaltimer);
}

function clearintervalfunc(){

}

function upvotepost(upops){
  hive.broadcast.send({
  extensions: [],
  operations: [upops[0]]
  }, [wif], (err, result) => {
  if(err){
    console.log(err)
    log('err', 'upvotepostautohighvp', JSON.stringify(err))
    return;
  }
  if(result){
    log('log', 'upvotepost:autovotehighvp', 'Upvoted @' + JSON.stringify(result.operations[0][1].author));
    setTimeout(upvoteparent, 6000, upops);
    return;
  }
});

}

function upvoteparent(upops){
  hive.broadcast.send({
  extensions: [],
  operations: [upops[1]]
  }, [wif], (err, result) => {
  if(err){
    log('err', 'upvotepostautohighvp', JSON.stringify(err));
    return;
  }
  if(result){
    log('log', 'upvoteparent:autovotehighvp', 'Upvoted @' +JSON.stringify(result.operations[0][1].author));
  }
});
}

module.exports = {
  storecomments
}