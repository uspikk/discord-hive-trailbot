const log = require('../discord/discord.js').log

function calculateall(coin, infos){
 let result = `Coin:${coin} Pair:${infos[0].pair} Price:${infos[0].price} \n----\n`
 for(var i=1;i<infos.length;i++){
  result = result + `_id:${infos[i]._id} \n`+`Ammount:${infos[i].ammount} \n` + `Entry:${infos[i].entry} \n`
  if(infos[i].close === null) result = result + `Closed:❌ \n` + `Profit:${(infos[0].price * infos[i].ammount)-(infos[i].entry * infos[i].ammount)} \n----\n`;
  if(infos[i].close !== null) result = result + `Closed:${infos[i].close} \n` + `Profit:${(infos[i].entry * infos[i].ammount)-(infos[i].close * infos[i].ammount)} \n----\n`
 }
 log('log', 'calculateall', result)
}

module.exports = {
  calculateall
}