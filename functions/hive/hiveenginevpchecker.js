const log = require('../discord/discord.js').log;
const addvotes = require('./enginetrailsystem.js').addvotes
const config = require('../../config.js').accounts
const axios = require('axios');
let day = require("dayjs")
let utc = require('dayjs/plugin/utc')
day.extend(utc)


function hevpcheck(type){
  axios(`https://scot-api.steem-engine.net/@${config.enginecuration}?hive=1`).then((result) => {
  let leo_vp = parseInt(result.data.LEO.voting_power) / 100;
  let weed_vp = parseInt(result.data.WEED.voting_power) / 100;
  let stem_vp = parseInt(result.data.STEM.voting_power) / 100;
  let pal_vp = parseInt(result.data.PAL.voting_power) / 100;
  let spt_vp = parseInt(result.data.SPT.voting_power) / 100;
  let battle_vp = parseInt(result.data.BATTLE.voting_power) / 100;
  let neoxian_vp = parseInt(result.data.NEOXAG.voting_power) / 100;
  
  let lastleo = day.utc(result.data.LEO.last_vote_time).unix();
  let lastweed = day.utc(result.data.WEED.last_vote_time).unix();
  let laststem = day.utc(result.data.STEM.last_vote_time).unix();
  let lastpal = day.utc(result.data.PAL.last_vote_time).unix();
  let lastspt = day.utc(result.data.SPT.last_vote_time).unix();
  let lastbattle = day.utc(result.data.BATTLE.last_vote_time).unix();
  let lastneoxian = day.utc(result.data.NEOXAG.last_vote_time).unix();
  
  let now = day.utc().unix()
  
  let diffleo = now - lastleo
  let diffweed = now - lastweed
  let diffstem = now - laststem
  let diffpal = now - lastpal
  let diffspt = now - lastspt
  let diffbattle = now - lastbattle
  let diffneoxian = now - lastneoxian


  leo_vp = leo_vp + (0.00023148148 * diffleo)
  weed_vp = weed_vp + (0.00023148148 * diffweed)
  stem_vp = stem_vp + (0.00023148148 * diffstem)
  pal_vp = pal_vp + (0.00023148148 * diffpal)
  spt_vp = spt_vp + (0.00023148148 * diffspt)
  battle_vp = battle_vp + (0.00023148148 * diffbattle)
  neoxian_vp = neoxian_vp + (0.00023148148 * diffneoxian)
  
  if(type === 'status'){
    let statuses = `leo:${leo_vp}\nweed:${weed_vp}\nstem:${stem_vp}\npal:${pal_vp}\nspt:${spt_vp}\nbattle:${battle_vp}\nneoxian:${neoxian_vp}`
    log('log', 'hevpcheck', statuses);
  }
  if(type === 'votes'){
    if(leo_vp > 95) addvotes(5, 'leo');
    if(weed_vp > 95) addvotes(5, 'weed');
    if(stem_vp > 95) addvotes(5, 'stem');
    if(pal_vp > 95) addvotes(5, 'pal');
    if(spt_vp > 95) addvotes(5, 'spt');
    if(battle_vp > 95) addvotes(5, 'battle');
    if(neoxian_vp > 95) addvotes(5, 'neoxian');
  }
  return;
  }).catch(err=>{log('err', 'hiveenginevpcheck', JSON.stringify(err))})
}



module.exports = {
  hevpcheck
}