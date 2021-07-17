const database = require('./mongomain.js').mongodb;
const calculateall = require('../trades/tradecalculator.js').calculateall

const dbServer = new database();

function connect(){
  dbServer.connect();
  return;
}

function listcoin(){
  dbServer.listcollections();
  return;
}

function addcoin(coin){
  dbServer.addcoin(coin);
  return;
}

function removecoin(coin){
  dbServer.coincollectionremove(coin);
  return;
}

function editbaseentry(coin, base, value){
  dbServer.editbaseentry(coin, base, value);
  return;
}

function addentry(coin, kogus, price){
  dbServer.addentry(coin, kogus, price);
  return;
}

function addclose(coin, id, close){
  dbServer.addclose(coin, id, close);
  return;
}
/*
function databasetest(){
  dbServer.testfunction().then(function(result){
    console.log(result)
  })
}
*/
function getallfromcollection(coll){
  dbServer.getentirecollection(coll).then(function(result){
    calculateall(coll, result);
  })
}


module.exports = {
  connect,
  listcoin,
  addcoin,
  removecoin,
  editbaseentry,
  addentry,
  addclose,
  //databasetest,
  getallfromcollection
}