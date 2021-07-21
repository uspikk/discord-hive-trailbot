const bootdiscord = require('./functions/discord/discord.js').boot;
const bootswitches = require('./config.js').bootswitches
const blockscanner = require('./functions/hive/blockscanner.js').startscanner
const adduser = require('./functions/hive/votetrail.js').adduser
const blurt = require('./functions/blurt/blurtmain.js').startvoter
const testscans = require('./functions/misc/scannertester.js').startintervalfunc
const blurtcurator = require('./functions/blurt/blurtcurator.js').start
const steemscanner = require('./functions/steem/steemblocks.js').start
const softclose = require('./functions/misc/savesoftclose.js').readlines
softclose();





function bootscript(){
  if(bootswitches.startblockscanner){
    blockscanner();
    blurt();
    blurtcurator();
    steemscanner();
  }
  if(bootswitches.bootinftrailaccs.length > 0){
    for(var i=0;i<bootswitches.bootinftrailaccs.length;i++){
      adduser([bootswitches.bootinftrailaccs[i], 'inf'])
    }
  }
  setTimeout(testscans, 10000)
}

module.exports = {
  bootscript
}

/*

fix steem voter

engine curation rebuild

engine voter powerdown

auto check vote power % notify

kentz cash out system

kentz testscanner

fix renew

web front end -- control linux terminals trough webpage idea


*/