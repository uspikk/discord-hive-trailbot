const SSC = require('sscjs');
const hive = require('@hiveio/hive-js');
const ssc = new SSC('https://api.hive-engine.com/rpc/');
const config = require('../../config').accounts
var fs = require('fs');

function datahead(){
  this.buyBook = [];
  this.sellBook = [];
  this.token = 'EEK';
  this.broadcastparameters = [];
  this.orderflow = []
  loaddata()
}

let data = new datahead()



function savedata(){
  fs.writeFile('./data/test.json', JSON.stringify(data.orderflow), function(err){
    if(err){
      return console.log(err);
    }
    console.log("the file was saved!")
  })
}

//depo hive function
function deposit(token, quantity, hive){
  let tokenIndex = data.orderflow.map(e => e.token).indexOf(token);
  if(tokenIndex >= 0){
    if(!hive) {
      data.orderflow[tokenIndex].totaltokens = (data.orderflow[tokenIndex].totaltokens + quantity).toFixed(data.orderflow[tokenIndex].decimal)*1;
      data.orderflow[tokenIndex].availabletokens = (data.orderflow[tokenIndex].availabletokens + quantity).toFixed(data.orderflow[tokenIndex].decimal)*1;
      data.orderflow[tokenIndex].deposittokens = (data.orderflow[tokenIndex].deposittokens + quantity).toFixed(data.orderflow[tokenIndex].decimal)*1;
    }
    if(hive) {
      data.orderflow[tokenIndex].totalhive = (data.orderflow[tokenIndex].totaltokens + quantity).toFixed(8)*1;
      data.orderflow[tokenIndex].availablehive = (data.orderflow[tokenIndex].availabletokens + quantity).toFixed(8)*1;
      data.orderflow[tokenIndex].deposithive = (data.orderflow[tokenIndex].deposithive + quantity).toFixed(8)*1;
    }
    console.log('depo success');
    savedata();
    return;
  }
  if(tokenIndex === -1 && hive){
    console.log('cannot make first depo hive');
    return;
  }
  if(tokenIndex === -1){
    ssc.find('tokens', 'tokens', {symbol:token}, 1000, 0, [], (err, result) => {
      if(err){
        console.log(err);
        return;
      }
      if(result){
        data.orderflow.push(
          {
            'token':token,
            'decimal': result[0].precision,
            'availabletokens':quantity,
            'availablehive':0,
            'deposittokens':quantity,
            'deposithive':0,
            'withdrawtokens':0,
            'withdrawhive':0,
            'totaltokens':quantity,
            'totalhive':0,
            'totalsell':0,
            'hivegained':0,
            'totalbuy':0,
            'tokengained':0,
            'lastsellprice':0,
            'lastbuyprice':0,
            'openorders':{
              'buy':{
                'original':[],
                'filled':[]
              },
              'sell':{
                'original':[],
                'filled':[]
              }
            }
          }
        )
        savedata();
        return;
      }
    })
  }
}

async function audit(token){
  let tokenIndex = data.orderflow.map(e => e.token).indexOf(token);
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
        let hiveTokens = 0
        if(result.length === 1000) console.log('OFFSET NEEDED');
        for(var i=0;i<result.length;i++){
          if(result[i].account === config.trade){
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
              'tokendatabase':data.orderflow[tokenIndex].totaltokens,
              'hivedatabase':data.orderflow[tokenIndex].totalhive
            }
            console.log(auditlog)
          })
        })
      })
    })
  })
}


//check if there is enough available token/hive
//crash available ammount
function submitOrder(token, quantity, price, type){
  if(type === 'sell'){
    //check available ammount
  }
  if(type === 'buy'){
    //check available ammount
  }
  let wholetx = [
    "custom_json",
    {
      "required_auths": [config.trade],
      "required_posting_auths": [],
      "id": "ssc-mainnet-hive",//ssc-mainnet-hive  ssc-mainnet1
      "json": JSON.stringify({
        "contractName": "market",
        "contractAction": type,
        "contractPayload": {
           "symbol": token,
           "quantity": quantity,
           "price": price
        }
      })
    }
   ]
   hive.broadcast.send({
    extensions: [],
    operations: [wholetx]}, [config.tradewif], (err, result) => {
     if(err){
      console.log(err);
      return;
    }
     if(result){
      ///console.log('order was sent')
        for(var i=0;i<data.orderflow.length;i++){////////salvestab ordedri ära memorysse
          if(data.orderflow[i].token === token){
            data.orderflow[i].openorders[type].original.push({
              'id':result.id,
              'quantity':quantity,
              'price':price
            })
            break;
          }
        }
        if(type === 'sell'){
          //-availabletokens
        }
        if(type === 'buy'){
          //-availablehive
        }
        savedata();
        setTimeout(saveOrder, 30000, token, type, result.id);
        return;
     }
   }); 
}
//submitOrder('EEK', '1', '0.021', 'buy')
function saveOrder(token, type, id){
  ssc.find('market',`${type}Book`,{symbol:`${token}`},1000, 0, [], (err, result)=>{
    if(err){
      return;
    }
    if(result){
      for(var i=0;i<result.length;i++){
        if(result[i].txId === id){
          for(var j=0;j<data.orderflow.length;j++){
            if(data.orderflow[j].token === token){
              data.orderflow[j].openorders[type].filled.push(result[i]);
              savedata();
              break;
            }
          }
        }
      }
    }
  }) 
}





//saveOrder('EEK', 'sell', '')



//replenish available token supply
function updatesaveorder(token, type, id){
  ssc.find('market', `${type}Book`,{symbol:`${token}`}, 1000, 0, [], (err, result)=>{
    if(err)return;
    if(result){
      let orderIndex = result.map(i => i.txId).indexOf(id)
      let tokenIndex = data.orderflow.map(e => e.token).indexOf(token);
      let orderIndexF = data.orderflow[tokenIndex].openorders[type].filled.map(a => a.txId).indexOf(id);
      let orderIndexO = data.orderflow[tokenIndex].openorders[type].original.map(i => i.id).indexOf(id);
      let ezDecimal = data.orderflow[tokenIndex].decimal
      let ezOrderflow = data.orderflow[tokenIndex].openorders[type].filled[orderIndexF]
      if(orderIndex >= 0){
        if(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].quantity === result[orderIndex].quantity){///kui summad on samasugused siis liigub edasi
          return;
        }
        else{
          if(type === 'sell'){
            let isold = (parseFloat(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].quantity) - parseFloat(result[orderIndex].quantity)).toFixed(ezDecimal)*1
            let hiveGained = ((parseFloat(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].quantity) - parseFloat(result[orderIndex].quantity))*parseFloat(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].price)).toFixed(8)*1
            data.orderflow[tokenIndex].totaltokens = (data.orderflow[tokenIndex].totaltokens - isold).toFixed(ezDecimal)*1;
            data.orderflow[tokenIndex].totalhive = (data.orderflow[tokenIndex].totalhive + hiveGained).toFixed(8)*1;
            data.orderflow[tokenIndex].totalsell = (data.orderflow[tokenIndex].totalsell + isold).toFixed(ezDecimal)*1;
            data.orderflow[tokenIndex].hivegained = (data.orderflow[tokenIndex].hivegained + hiveGained).toFixed(8)*1;
            data.orderflow[tokenIndex].lastsellprice = JSON.parse(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].price);
            data.orderflow[tokenIndex].openorders[type].filled[orderIndexF] = result[orderIndex];
            //+availablehive
            savedata()
            return;
          }
          if(type === 'buy'){
            let iBuy = (JSON.parse(ezOrderflow.quantity)-JSON.parse(result[orderIndex].quantity)).toFixed(ezDecimal)*1;
            let hiveLost = (iBuy*result[orderIndex].price).toFixed(8)*1;
            data.orderflow[tokenIndex].totaltokens = (data.orderflow[tokenIndex].totaltokens + iBuy).toFixed(ezDecimal)*1;
            data.orderflow[tokenIndex].totalhive = (data.orderflow[tokenIndex].totalhive - hiveLost).toFixed(8)*1;
            data.orderflow[tokenIndex].totalbuy = (data.orderflow[tokenIndex].totalbuy + hiveLost).toFixed(8)*1;
            data.orderflow[tokenIndex].tokengained = (data.orderflow[tokenIndex].tokengained + iBuy).toFixed(8)*1;
            data.orderflow[tokenIndex].lastbuyprice = JSON.parse(result[orderIndex].price);
            data.orderflow[tokenIndex].openorders[type].filled[orderIndexF] = result[orderIndex];
            //+availabletoken
            savedata();
            return;
          }
        }
      }
      if(orderIndex === -1){
        if(type === 'sell'){
          data.orderflow[tokenIndex].totalsell = (data.orderflow[tokenIndex].totalsell + JSON.parse(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].quantity)).toFixed(ezDecimal)*1;
          data.orderflow[tokenIndex].lastsellprice = JSON.parse(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].price);
          data.orderflow[tokenIndex].hivegained = (data.orderflow[tokenIndex].hivegained + (JSON.parse(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].price) * JSON.parse(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].quantity))).toFixed(8)*1;
          data.orderflow[tokenIndex].totaltokens = (data.orderflow[tokenIndex].totaltokens - JSON.parse(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].quantity)).toFixed(ezDecimal)*1;
          data.orderflow[tokenIndex].totalhive = (data.orderflow[tokenIndex].totalhive + (JSON.parse(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].price) * JSON.parse(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].quantity))).toFixed(8)*1;
          //+availablehive
          if(orderIndexO >= 0)data.orderflow[tokenIndex].openorders[type].original.splice(orderIndexO, 1);
          if(orderIndexF >= 0)data.orderflow[tokenIndex].openorders[type].filled.splice(orderIndexF, 1);
          savedata();
          return;
        }
        if(type === 'buy'){
          data.orderflow[tokenIndex].totaltokens = (data.orderflow[tokenIndex].totaltokens + JSON.parse(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].quantity)).toFixed(ezDecimal)*1;
          data.orderflow[tokenIndex].totalhive = (data.orderflow[tokenIndex].totalhive - (JSON.parse(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].quantity) * JSON.parse(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].price))).toFixed(8)*1;
          data.orderflow[tokenIndex].totalbuy = (data.orderflow[tokenIndex].totalbuy + (JSON.parse(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].quantity) * JSON.parse(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].price))).toFixed(8)*1;
          data.orderflow[tokenIndex].tokengained = (data.orderflow[tokenIndex].tokengained + JSON.parse(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].quantity)).toFixed(ezDecimal)*1;
          data.orderflow[tokenIndex].lastbuyprice = JSON.parse(data.orderflow[tokenIndex].openorders[type].filled[orderIndexF].price);
          //availabletoken
          if(orderIndexO >= 0)data.orderflow[tokenIndex].openorders[type].original.splice(orderIndexO, 1);
          if(orderIndexF >= 0)data.orderflow[tokenIndex].openorders[type].filled.splice(orderIndexF, 1);
          savedata();
          return;
        }

      }
    }
  })
}

//updatesaveorder('EEK', 'buy', '70b0015b4f250b0f0de453df223d9388abe2aef6')

//replenish available supply
function cancelorder(token, type, id){
  let wholetx = [
    "custom_json",
    {
      "required_auths": [config.trade],
      "required_posting_auths": [],
      "id": "ssc-mainnet-hive",//ssc-mainnet-hive  ssc-mainnet1
      "json": JSON.stringify({
	      "contractName" : "market",
	      "contractAction" : "cancel",
	      "contractPayload": {
	          "type":type,
	          "id":id
	          }
	    })
    }
  ]
  hive.broadcast.send({
    extensions: [],
    operations: [wholetx]}, [config.tradewif], (err, result) => {
    if(err){
      console.log(err);
      return;
    }
    if(result){
      let tokenIndex = data.orderflow.map(e => e.token).indexOf(token);
      let orderIndexO = data.orderflow[tokenIndex].openorders[type].original.map(i => i.id).indexOf(id);
      let orderIndexF = data.orderflow[tokenIndex].openorders[type].filled.map(a => a.txId).indexOf(id);
      if(orderIndexO >= 0)data.orderflow[tokenIndex].openorders[type].original.splice(orderIndexO, 1);
      if(orderIndexF >= 0)data.orderflow[tokenIndex].openorders[type].filled.splice(orderIndexF, 1);
      savedata()
    }
  });
}
//cancelorder('EEK', 'sell', 'e0a524762c264d1cf47a2b47d8a1e194205dc3c5')

function listorder(){

}

function withdraw(token, iHive, ammount){
  let tokenIndex = data.orderflow.map(e => e.token).indexOf(token);
  if(tokenIndex === -1){
    console.log('No token in database');
    return;
  }
  if(iHive && data.orderflow[tokenIndex].availablehive < ammount){
    console.log('not enough hive on pair');
    return;
  }
  if(!iHive && data.orderflow[tokenIndex].availabletokens < ammount){
    console.log('not enough tokens on pair');
    return;
  }
  let txbase
  if(iHive){
    txbase = {
      "contractName": "tokens",
      "contractAction": "transfer",
      "contractPayload": {
        "symbol": "SWAP.HIVE",
        "to": config.estoniatrail,
        "quantity": JSON.stringify(ammount),
        "memo": ""
      }
    }
  }
  if(!iHive){
    txbase = {
      "contractName": "tokens",
      "contractAction": "transfer",
      "contractPayload": {
        "symbol": token,
        "to": config.estoniatrail,
        "quantity": JSON.stringify(ammount),
        "memo": ""
      }
    }
  }
  let wholetx = [
    "custom_json",
    {
      "required_auths": [config.trade],
      "required_posting_auths": [],
      "id": "ssc-mainnet-hive",//ssc-mainnet-hive  ssc-mainnet1
      "json": JSON.stringify(txbase)
    }
  ]
  hive.broadcast.send({
    extensions: [],
    operations: [wholetx]}, [config.tradewif], (err, result) => {console.log(err, result);
      if(err){/*log('err', 'emptyvoter:broadcast', JSON.stringify(err));/*setTimeout(addqueue, 3000, JSON.parse(wholetx[1].json));*/return;}
      if(result){
        if(iHive){
          data.orderflow[tokenIndex].availablehive = (data.orderflow[tokenIndex].availablehive - ammount).toFixed(8)*1;
          data.orderflow[tokenIndex].withdrawhive = (data.orderflow[tokenIndex].withdrawhive + ammount).toFixed(8)*1;
          data.orderflow[tokenIndex].totalhive = (data.orderflow[tokenIndex].totalhive - ammount).toFixed(8)*1;
        }
        if(!iHive){
          data.orderflow[tokenIndex].availabletokens = (data.orderflow[tokenIndex].availabletokens - ammount).toFixed(data.orderflow[tokenIndex].decimal)*1;
          data.orderflow[tokenIndex].withdrawtokens = (data.orderflow[tokenIndex].withdrawtokens + ammount).toFixed(data.orderflow[tokenIndex].decimal)*1;
          data.orderflow[tokenIndex].totaltokens = (data.orderflow[tokenIndex].totaltokens - ammount).toFixed(data.orderflow[tokenIndex].decimal)*1;
        }
        /*log('log', 'emptyvoter:broadcast', JSON.stringify(result.operations[0][0] + ' + ' + JSON.parse(result.operations[0][1].json).length + ' Ops'));*/
        //setTimeout(broadcast, 3000);
        savedata();
        return;
      }
  });
}


function loaddata(){
  fs.readFile('./data/test.json', function(err, loadData){
    if(err){
      return console.log(err);
    }
    data.orderflow = JSON.parse(loadData)
    //console.log(data.orderflow[0])
    //withdraw('EEK', false, 0.1);
    //deposit('EEK', 1)
    audit('EEK')
  })
}

//deposit mechanism+
//keep track how many coins flowing in each pair 
//withdraw mechanism+
//integration with rest of bot
//data exporting orders balances active tokens stats audit
//renew orders
//




module.exports = {
  submitOrder,
  updatesaveorder,
  cancelorder
}
/*

*/
