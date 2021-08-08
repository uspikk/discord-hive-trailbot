const axios = require('axios');

function data(){
  this.splintercards;
} 

function updatedecbalances(){
  axios(`https://api.splinterlands.io/players/balances?username=splintercards`).then((result) => {
    console.log(result.data)
  });
}

decbalances();