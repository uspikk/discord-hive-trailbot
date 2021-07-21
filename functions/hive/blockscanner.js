let hive = require('@hiveio/hive-js');
let broadcast = require('./broadcast.js').broadcast;
let hevpcheck = require('./voterv2.js').bootfile

var scanner = new scannerhead();

function scannerhead(){
  this.running = false;
  this.block;
  this.errcount = 0;
  this.enginevpcheck = 0;
}

function updateheadblock(){
  const log = require('../discord/discord.js').log
  hive.api.getDynamicGlobalProperties(function(err, result) {
    if(err){
      log('err', 'updateheadblock', JSON.stringify(err));
      return;
    }
    if(result){
      scanner.block = result.head_block_number;
      log('log', 'updateheadblock', `starting scanner from block ${scanner.block}`);
      getblock();
      return;
    }
  });
}

function addblock(){///stupid shit
  scanner.block++;
  if(scanner.enginevpcheck === 0){
    scanner.enginevpcheck = scanner.block + 200
    hevpcheck();
  }
  if(scanner.enginevpcheck === scanner.block){
    scanner.enginevpcheck = scanner.block + 200
    hevpcheck();
  }
  getblock();
}

function getblock(){
  const log = require('../discord/discord.js').log
  const blockfilter = require('./blockfilter.js').blockfilter
  if(!scanner.running)return;
  if(scanner.errcount === 10)scanner.running = false;
  hive.api.getBlock(scanner.block, function(err, result) {
    if(err){
      if(scanner.errcount === 9) log('err', `getblock:${scanner.errcount}`, JSON.stringify(err));
      scanner.errcount++;
      setTimeout(getblock, 1500)
      return;
    }
    if(result){
      scanner.errcount = 0;
      blockfilter(result.transactions)
      broadcast();
      return;
    }
    if(!err && !result){
      scanner.errcount++;
      setTimeout(getblock, 1500);
      return;
    }
  });
}

function startscanner(){
  scanner = new scannerhead();
  scanner.running = true;
  updateheadblock();
  return;
}

function stopscanner(){
  scanner = new scannerhead();
}

function exportblock(){
  return new Promise(function(resolve, reject){
    resolve(scanner.block)
  })
}



module.exports = {
  startscanner,
  addblock,
  stopscanner,
  exportblock
}