const SSC = require('sscjs');
const ssc = new SSC('https://api.hive-engine.com/rpc/');
const config = require('../../poolconfig.js').pools


function checkwallet(offset){
    ssc.find('tokens','balances',{account:"nrg"},1000, offset, [], (err, result)=>{
      if(err){
        console.log(err);
        return
      }
      if(result){
        for(var i=0;i<config.length;i++){
          for(var j=0;j<result.length;j++){
              let preSet = config[i]
              let walletData = result[j]
              if(preSet.token === walletData.symbol && preSet.autoSize < walletData.balance){
                  walletData.preSet = preSet
                  console.log(walletData)
                  getpools(walletData, offset)
              }
          }
      }
      }
    })
}



function getpools(walletData, offset){
    ssc.find('marketpools','pools',{},1000, offset, [], (err, result)=>{
      if(err){
        //log('err', 'reneworders:gettokenbals', JSON.stringify(err));
        return;
      }
      if(result){
        let pool = result[walletData.preSet._id]
        let half = (walletData.balance / 2)-(walletData.balance / 2)*5/100
        let tokensOut = (half*pool.quotePrice).toFixed(3)*1
        //console.log(result)
        //console.log(tokensOut)
        //console.log(walletData, result[walletData.preSet._id])
      }
    })
}

function calculateprice(offset){
    ssc.find('marketpools','liquidityPositions',{tokenPair:'SWAP.HIVE:WEED'},1000, offset, [], (err, result)=>{
        if(err){
          //log('err', 'reneworders:gettokenbals', JSON.stringify(err));
          return;
        }
        if(result){
            console.log(result)
        }
      }) 
}

//calculateprice(0)
checkwallet(0)
