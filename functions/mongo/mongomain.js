const mongo = require("mongodb").MongoClient
const log = require('../discord/discord.js').log
const config = require('../../config.js').config
const databasetest = require('./mongo.js').databasetest

function mongodb() {
    this.url = 'mongodb://localhost:27017';
    this.db;
    this.globalcollection;
}

mongodb.prototype.connect = function() {
  const databasetest = require('./mongo.js').databasetest
    mongo.connect(this.url,{useUnifiedTopology: true}, (err, client) => {
        if (err) {
            console.error(err);
            return;
        }
        if(client){
          this.db = client.db(config.dbname);
          //this.coinadd('asdd')
          //this.coincollection = this.db.collection("coins");
        }
    })
}

mongodb.prototype.testfunction = function(){
  const DB = this.db
  return new Promise(function(resolve, reject){
    DB.listCollections({name:'a'}).toArray(function(err, collInfos){
      if(err) throw err;
      resolve(collInfos);
    })
  })
}

mongodb.prototype.listcollections = function(){
  this.db.listCollections().toArray(function(err, collInfos) {
    if(err){
      log('err', 'mongodb.listcollections', 'db.listCollections returned err');
      return;
    }
    if(!collInfos){
      log('log', 'mongodb.listcollections', 'db.listCollections returned nothing');
      return;
    }
    if(collInfos){
      var collarray = '';
      for(var i=0;i<collInfos.length;i++){
        collarray = collarray + collInfos[i].name + ' \n'
      }
      log('log', 'mongodb.listcollections', collarray)
      return;
    }
  });
}

mongodb.prototype.addcoin = function(coinname) {
  const DB = this.db
  this.db.listCollections({name: coinname}).next(function(err, collinfo) {
    if (collinfo) {
      log('err', 'mongodb.addcoin', 'See coin juba eksisteerib andmebaasis.')
      return;
    }
    if(err){
      log('err', 'mongodb.addcoin', 'db.listCollections returned error');
      return;
    }
    if(!collinfo) {
      DB.createCollection(coinname, {}, (err, newCollection)=>{
        if(err){
          log('err', 'mongodb.coinadd', 'db.createCollection returned err');
          return;
        }
        if(newCollection){
          DB.collection(coinname).insertOne({
            _id:0,
            type:null,
            pair:null,
            price:0
          }, (err, baseitem)=>{
            if(err){
              log('err', 'mongodb.coinadd', 'collection.insertOne returned err');
              return;
            }
            if(baseitem){
              log('log', 'mongodb.coinadd', 'Base entry added successfully');
              return;
            }
          })
        }
      })
    }
  });
}

mongodb.prototype.coincollectionremove = function(coinname) {
  const DB = this.db;
  this.db.listCollections({name:coinname}).next(function(err, collinfo){
    if(err){
      log('err', 'mongodb.coincollectionremove', 'db.listCollections returned error');
      return;
    }
    if(!collinfo){
      log('err', 'mongodb.coincollectionremove', 'Sellist coini ei leidnud');
      return;
    }
    if(collinfo){
      DB.collection(coinname).drop(function(err, delOK){
        if(err){
          log('err', 'mongodb.coincollectionremove', 'DB.collection.drop returned error');
          return;
        }
        if(delOK){
          log('log', 'mongodb.coincollectionremove', 'Coin edukalt eemaldatud');
          return;
        }
      })
    }
  })
}

mongodb.prototype.editbaseentry = function(coin, base, value){
  const DB = this.db;
  this.db.listCollections({name:coin}).next(function(err, collinfo){
    if(err){
      log('err', 'mongodb.editbaseentry', 'db.listCollections returned error');
      return;
    }
    if(!collinfo){
      log('err', 'mongodb.editbaseentry', 'Ei leidnud sellise nimega coini');
      return;
    }
    if(collinfo){
      DB.collection(coin).updateOne({_id:0}, {'$set':{
        [base]:value
      }},(err, update) =>{
        if(err){
          log('err', 'mongodb.editbaseentry', 'Collection.updateOne returned error');
          return;
        }
        if(update){
          log('log', 'mongodb.editbaseentry', 'Baas sissekanne edukalt uuendatud');
          return;
        }
      })
    }
  })
}

mongodb.prototype.addentry = function(coin, kogus, entryprice){
  const DB = this.db;
  this.db.listCollections({name:coin}).next(function(err, collinfo){
    if(err){
      log('err', 'mongodb.addentry', 'db.listCollections returned error');
      return;
    }
    if(!collinfo){
      log('err', 'mongodb.addentry', 'Sellise nimega coini ei eksisteeri');
      return;
    }
    if(collinfo){
      DB.collection(coin).countDocuments({}, (err, result)=>{
        if(err){
          log('err', 'mongodb.addentry', 'countDocuments returned error');
          return;
        }
        if(result){
          DB.collection(coin).insertOne({
            _id:result,
            ammount:kogus,
            entry:entryprice,
            close:null
          }, (err, tradeitem) =>{
            if(err){
              log('err', 'mongodb.addentry', 'insertOne returned error');
              return;
            }
            if(tradeitem){
              log('log', 'mongodb.addentry', 'Entry price added successfully');
              return;
            }
          })
        }
      })
    }
  })
}

mongodb.prototype.addclose = function(coin, id, exitprice){
  const DB = this.db;
  this.db.listCollections({name:coin}).next(function(err, collinfo){
    if(err){
      log('err', 'mongodb.addclose', 'db.listcollections returned error');
      return;}
      if(!collinfo){
       log('err', 'mongodb.addclose', 'Sellise nimega coini ei leidnud');
      return;
    }
    if(collinfo){
      DB.collection(coin).updateOne({_id:id}, {'$set':{
        close:exitprice
      }},(err, updatedDoc)=>{
        if(err){
          log('err', 'mongodb.addclose', 'updateOne returned error');
          return;
        }
        if(updatedDoc){
          log('log', 'mongodb.addclose', 'Trade edukalt suletud');
          return;
        }
      })
    }
  })
}

mongodb.prototype.getentirecollection = function(coll){
  const DB = this.db
  return new Promise(function(resolve, reject){
    DB.listCollections({name:coll}).next(function(err, collinfo){
      if(err){
        log('err', 'mongodb.getentirecollection', 'db.listcollections returned error');
        return;
      }
      if(!collinfo){
        log('err', 'mongodb.getentirecollection', 'Sellise nimega coini ei eksisteeri');
        return;
      }
      if(collinfo){
        DB.collection(coll).find().toArray((err, items) => {
          if(err) {
            log('err', 'mongodb.getentirecollection', 'find().toArray() returned error');
            return;
          }
          resolve(items);
        })
      }
    })
  })
}



module.exports={
  mongodb
}