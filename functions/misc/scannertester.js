const getblurtblock = require('../blurt/blurtmain.js').exportblock
const gethiveblock = require('../hive/blockscanner.js').exportblock

const startblurt = require('../blurt/blurtmain.js').startvoter
const starthive = require('../hive/blockscanner.js').startscanner


const log = require('../discord/discord.js').log

const tester = new scannertester();

function scannertester(){
  this.blurtlastblock;
  this.hivelastblock;
  this.hiveblock=0;
  this.blurtblock=0;
  this.interval = 300000;
  this.intervalfunc;
}


scannertester.prototype.testscans = function(){
  getblurtblock().then(function(result){
    tester.blurtblock = result;
    gethiveblock().then(function(result){
      tester.hiveblock = result;
      if(tester.blurtlastblock === tester.blurtblock){
        log('err', 'scannertester.testscans', 'Attemting to restart blurt scanner...');
        startblurt();
      }
      if(tester.hivelastblock === tester.hiveblock){
        log('err', 'scannertester.testscans', 'Attempting to restart hive scanner...');
        starthive(tester.block);
      }
      tester.addoldnewblock();
      return;
    })
  })
}

scannertester.prototype.addoldnewblock = function(){
  tester.blurtlastblock = tester.blurtblock;
  tester.hivelastblock = tester.hiveblock;
}


function starttestingscans(){
  tester.testscans();
}

function startintervalfunc(){
  tester.intervalfunc = setInterval(tester.testscans, tester.interval);
  log('log', 'startintervalfunc', 'Started scanner interval function');
}

function clearinterval(){
  clearInterval(tester.intervalfunc);
  log('log', 'clearinterval', 'Cleared scannertester interval');
}

module.exports = {
  starttestingscans,
  startintervalfunc,
  clearinterval
}