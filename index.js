const bootdiscord = require('./functions/discord/discord.js').boot;
const bootswitches = require('./config.js').bootswitches
const blockscanner = require('./functions/hive/blockscanner.js').startscanner
const adduser = require('./functions/hive/votetrail.js').adduser
const blurt = require('./functions/blurt/blurtmain.js').startvoter
const testscans = require('./functions/misc/scannertester.js').startintervalfunc




function bootscript(){
  
  if(bootswitches.startblockscanner){
    blockscanner();
    blurt();
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
voter check votes before voting to mitigate the same vote error

estonia trail to work with comments

(node:10192) Warning: Accessing non-existent property 'databasetest' of module exports inside circular dependency


*/