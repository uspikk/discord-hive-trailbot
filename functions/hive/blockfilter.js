
function blockfilter(ops){
  const votetrail = require('./votetrail.js').scanvotes
  const nextblock = require('./blockscanner.js').addblock
  for(var i=0;i<ops.length;i++){
    for(var j=0;j<ops[i].operations.length;j++){
      let op = ops[i].operations[j];
      if(op[0]==='vote'){
        votetrail(op);
      }
    }
  }
  nextblock();
  return;
}

module.exports = {
  blockfilter
}