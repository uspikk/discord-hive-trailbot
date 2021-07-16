const readline = require('readline');
const stopblurtcurator = require('../blurt/blurtcurator.js').stopsave

function readlines(){
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', (str, key) => {
  if(key.ctrl && key.name === "q"){
    console.log("ctrl+c = shutdown")
    console.log("ctrl+r = ram usage")
  }
 /* if (key.ctrl && key.name === 'c') {
    if(conf.dev === true){process.exit(0)}
    else{stopallsavings(1);}}
  if (key.ctrl && key.name === "r"){ramusage();}*/
  if(key.ctrl && key.name === "c"){
    console.log('stopping saving');
    stopblurtcurator();
    setTimeout(softclose, 3000);
  }
});
}

function softclose(){
  console.log('exiting.')
  process.exit(0)
}

module.exports = {
  readlines
}