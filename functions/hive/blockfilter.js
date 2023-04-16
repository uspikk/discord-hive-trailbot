const enginevoter = require('./voterv2.js').recievevotes
const estoniatrail = require('./estoniatrail.js').processcomments

function blockfilter(ops){
  const votetrail = require('./votetrail.js').scanvotes
  const nextblock = require('./blockscanner.js').addblock
  for(var i=0;i<ops.length;i++){
    for(var j=0;j<ops[i].operations.length;j++){
      let op = ops[i].operations[j];
      if(op[0] === 'comment'){
        if(ops[i].operations[j+1]){ ///check if allow curation rewards
          if(ops[i].operations[j+1][0] === 'comment_options'){
              if(!ops[i].operations[j+1][1].allow_curation_rewards){
                  console.log('pass')
                  continue;
              }
          }
      }
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