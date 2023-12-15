const SSC = require('sscjs');
const hive = require('@hiveio/hive-js');
const ssc = new SSC('https://api.hive-engine.com/rpc/');
let config = {
  trade:'volume'
}

async function audit(token){
  //let tokenIndex = data.orderflow.map(e => e.token).indexOf(token);
  function delay(t, v) {
    return new Promise(resolve => setTimeout(resolve, t, v));
  }
  const getbuyorderbook = new Promise(function(resolve, reject){
    ssc.find('market',`buyBook`,{symbol:`${token}`},1000, 0, [], (err, result)=>{
      if(err){
        console.log(err)
        return;
      }
      if(result){
        result.sort((a, b) => JSON.parse(b.price) - JSON.parse(a.price))
        let hiveTokens = 0
        if(result.length === 1000) console.log('OFFSET NEEDED');
        for(var i=0;i<result.length;i++){
          if(result[i].account === config.trade){
            console.log(result[i])
            hiveTokens = hiveTokens + (JSON.parse(result[i].quantity)*JSON.parse(result[i].price));
          }
        }
        resolve(hiveTokens)
      }
    })
  })
  const getsellorderbook = new Promise(function(resolve, reject){
    ssc.find('market',`sellBook`,{symbol:`${token}`},1000, 0, [], (err, result)=>{
      if(err){
        console.log(err)
        return;
      }
      if(result){
        let nativeTokens = 0
        if(result.length === 1000) console.log('OFFSET NEEDED');
        for(var i=0;i<result.length;i++){
          if(result[i].account === config.trade){
            console.log(result[i])
            nativeTokens = nativeTokens + (JSON.parse(result[i].quantity));
          }
        }
        resolve(nativeTokens)
      }
    })
  })
  const getbalance = new Promise(function(resolve, reject){
    ssc.find('tokens', 'balances', {account:config.trade}, 1000, 0, [], (err, result) => {
      if(err){
        console.log(err);
        return;
      }
      if(result){
        if(result.length === 1000)console.log('OFFSET NEEDED');
        let balanceArray = []
        balanceArray.push(JSON.parse(result[result.map(e => e.symbol).indexOf('SWAP.HIVE')].balance))
        balanceArray.push(JSON.parse(result[result.map(e => e.symbol).indexOf(token)].balance))
        resolve(balanceArray)
      }
    })
  })
  getbuyorderbook.then(function(buybook){
    delay(5000).then(function(){
      getsellorderbook.then(function(sellbook){
        delay(5000).then(function(){
          getbalance.then(function(balance){
            let auditlog = {
              'tokens':balance[1],
              'hive':balance[0],
              'tokensinorderbook':sellbook,
              'hiveinorderbook':buybook,
              'tokendatabase':7,
              'hivedatabase':0
            }
            console.log(auditlog)
          })
        })
      })
    })
  })
}

audit('BXT') 