const hive = require('@hiveio/hive-js');
const log = require('../discord/discord.js').log;
const account = require('../../config.js').accounts.estoniatrail;
const wif = require('../../config.js').accounts.estoniatrailwif;


const auto = new autovotehighvp();

function autovotehighvp(){
  this.manaPrec = 70;
  this.votePrec = 7500;
}


autovotehighvp.prototype.testvp = function(post){
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
      if(currentManaPerc > auto.manaPrec){
        setTimeout(upvotepost, 30, upops);
      }
    }
  });
}

function storecomments(post){
 auto.testvp(post);
}

function upvotepost(upops){
  hive.broadcast.send({
  extensions: [],
  operations: [upops[0]]
  }, [wif], (err, result) => {
  if(err){
    log('err', 'upvotepostautohighvp', JSON.stringify(err))
    return;
  }
  if(result){
    log('log', 'upvotepost:autovotehighvp', JSON.stringify(result.operations));
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
    log('log', 'upvoteparent:autovotehighvp', JSON.stringify(result.operations));
  }
});
}

module.exports = {
  storecomments
}