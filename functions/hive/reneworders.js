const SSC = require('sscjs');
const ssc = new SSC('https://api.hive-engine.com/rpc/');
const log = require('../discord/discord.js').log;
const acc = require('../../config.js').accounts.estoniatrail
const wif = require('../../config.js').accounts.estoniatrailactivewif
const hive = require('@hiveio/hive-js');

let data = new database();

function database(){
	this.coinlist = [];
	this.step = 0;
	this.laststep = 0;
	this.sidestep = 0;
	this.lastcheckstep = 0;
	this.txarray = [];
	this.err = false;
	this.broadcastrun = true;
}


function gettokenbals(offset){
	log('log', 'reneworders:gettokenbals', 'Starting renewing orders.');
  if(offset === 0) data = new database();
  ssc.find('tokens','balances',{account:acc},1000, offset, [], (err, result)=>{
    if(err){
    	log('err', 'reneworders:gettokenbals', JSON.stringify(err));
    	return;
    }
    if(result){
    	for(var i=0;i<result.length;i++){
    		data.coinlist.push(result[i]);
    	}
    	if(result.length === 1000){
    		offset = offset + 1000
    		gettokenbals(offset);
    		return;
    	}
    	stepper()
    }
  })
}

function stepper(){
	if(data.step > data.coinlist.length){
    log('log', 'renew:stepper', `Stepper has finished successfully with ${data.txarray.length} orders`)
    broadcast()
    return;
	}
  if(data.coinlist.length > 0){
 	data.laststep = data.coinlist.length
 	if(data.sidestep === 0){
    renewlong(data.coinlist[data.step].symbol)
    return;
 	}
 	if(data.sidestep === 1){
    renewshort(data.coinlist[data.step].symbol)
    return;
 	}
 }
 else{
 	log('err', 'reneworders:stepper', 'No database to step');
 	return;
 }
}

function broadcast(){
  log('log', 'reneworders:broadcast', "transaction queue length: " + data.txarray.length)
 if(data.txarray.length === 0){
 	data = new database();
 	log('log', 'reneworders:broadcast', 'Done renewing orders');
  return;
 };
 let wholetx = [
  "custom_json",
  {
    "required_auths": [acc],
    "required_posting_auths": [],
    "id": "ssc-mainnet-hive",//ssc-mainnet-hive  ssc-mainnet1
    "json": JSON.stringify(data.txarray.splice(0, 60))
  }
 ]
 hive.broadcast.send({
   extensions: [],
   operations: [wholetx]}, [wif], (err, result) => {
    if(err){log('err', 'reneworders:broadcast', JSON.stringify(err));setTimeout(addqueue, 3000, JSON.parse(wholetx[1].json));return;}
    if(result){
    	log('log', 'reneworders:broadcast', JSON.stringify(result.operations[0][0] + ' + ' + JSON.parse(result.operations[0][1].json).length + ' Ops'));
    	setTimeout(broadcast, 3000);
    	return;
    }
  });
}

function addqueue(jsons){
 for(var i=0;i<jsons.length;i++){
   data.txarray.push(jsons[i])
  if(i === jsons.length - 1){
    broadcast();
  }
 }
}



function renewlong(symbol){
  ssc.find('market','buyBook',{symbol:symbol, account:acc},1000, 0, [], (err, result)=>{
    if(err){
    	log('err', 'renewlong', JSON.stringify(err.message)+ `\n ${data.step} of ${data.coinlist.length} Steps \n txcount:${data.txarray.length}`);
    	setTimeout(renewlong, 15000, symbol);
    	return;
    }
    if(result){
      sortlong(symbol, result);
      return;
    }
  });
}

function sortlong(symbol, orders){
	if(orders.length === 0){
		data.sidestep++;
		stepper();
		return;
	}
	if(orders.length > 0){
		for(var i=0;i<orders.length;i++){
      data.txarray.push({
	      "contractName" : "market",
	      "contractAction" : "cancel",
	      "contractPayload": {
	          "type":"buy",
	          "id":orders[i].txId
	          }
	        });
      data.txarray.push({
	      "contractName" : "market",
	      "contractAction" : "buy",
	      "contractPayload" : {
	         "symbol": symbol,
	         "quantity": orders[i].quantity,
	         "price": orders[i].price
	         }
	    });
		}
	}
  data.sidestep++;
  stepper();
  return;
}

function renewshort(symbol){
  ssc.find('market','sellBook',{symbol:symbol, account:acc},1000, 0, [], (err, result)=>{
    if(err){
    	log('err', 'renewshort', JSON.stringify(err.message)+ `\n ${data.step} of ${data.coinlist.length} Steps \n txcount:${data.txarray.length}`);
    	setTimeout(renewshort, 15000, symbol);
    	return;
    }
    if(result){
      sortshort(symbol, result);
      return;
    }
  });
}

function sortshort(symbol, orders){
	if(orders.length === 0){
		data.sidestep = 0;
		data.step++;
		stepper();
		return;
	}
	if(orders.length > 0){
		for(var i=0;i<orders.length;i++){
      data.txarray.push({
	      "contractName" : "market",
	      "contractAction" : "cancel",
	      "contractPayload": {
	          "type":"sell",
	          "id":orders[i].txId
	          }
	        });
      data.txarray.push({
	      "contractName" : "market",
	      "contractAction" : "sell",
	      "contractPayload" : {
	         "symbol": symbol,
	         "quantity": orders[i].quantity,
	         "price": orders[i].price
	         }
	    });
		}
	}
	data.sidestep = 0;
	data.step++;
  stepper();
  return;
}

function renewtimer(){
	gettokenbals(0);
	setTimeout(renewtimer, 86400000);
}



module.exports = {
	gettokenbals,
	renewtimer
}
