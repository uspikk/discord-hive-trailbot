const bootdiscord = require('./functions/discord/discord.js').boot;
const bootswitches = require('./config.js').bootswitches
const blockscanner = require('./functions/hive/blockscanner.js').startscanner
const adduser = require('./functions/hive/votetrail.js').adduser
const blurt = require('./functions/blurt/blurtmain.js').startvoter
const testscans = require('./functions/misc/scannertester.js').startintervalfunc
const steemscanner = require('./functions/steem/steemblocks.js').start
const reneworders = require('./functions/hive/reneworders').renewtimer





function bootscript(){
  if(bootswitches.startblockscanner){
    blockscanner();
    blurt();
    steemscanner();
  }
  if(bootswitches.bootinftrailaccs.length > 0){
    for(var i=0;i<bootswitches.bootinftrailaccs.length;i++){
      adduser([bootswitches.bootinftrailaccs[i], 'inf'])
    }
  }
  setTimeout(testscans, 10000)
  setTimeout(reneworders, 100000)
}

module.exports = {
  bootscript
}

/*

launch parameters

dec view balance

revised error handling

rebuild steem voting to work with comments base product built up

trading bot

engine curation rebuild{revise vote top authors, only vote on first posts}

engine voter powerdown

autovotehighvp rewrite+

kentz testscanner

fix renew

web front end -- control linux terminals trough webpage idea

trading bot detect way too high top order

renew orders see if can retrieve multiple coins with single call


*/