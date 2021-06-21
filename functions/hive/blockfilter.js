const enginevoter = require('./enginetrailsystem.js').recievevotes
const estoniatrail = require('./estoniatrail.js').processcomments

function blockfilter(ops){
  const votetrail = require('./votetrail.js').scanvotes
  const nextblock = require('./blockscanner.js').addblock
  const addcomment = require('./autovoteifhighvp.js').storecomments///delete
  for(var i=0;i<ops.length;i++){
    for(var j=0;j<ops[i].operations.length;j++){
      let op = ops[i].operations[j];
      if(op[0] === 'comment'){
        enginevoter(op);
        estoniatrail(op);
        continue;
      }
      if(op[0]==='vote'){
        votetrail(op);
        continue;
      }
    }
  }
  nextblock();
  return;
}

module.exports = {
  blockfilter
}