let sweetspot = 400
let orders = 10
let money = 100
let smallestorer = 0.1
let smallestorderstart = 105

let order = [];

let calculatesweetspot = smallestorer*sweetspot/100
let moneyequally = money / orders
let calculatestartorder = smallestorer*smallestorderstart/100



function getorderheight(number){
  let half = calculatesweetspot
  return number*half/50
}

function getorderprecent(number){
  let half = orders*50/100
  return number*50/half
}
getorderprecent(10)
for(var i=0;i<orders;i++){
  let pushorder = {
    'size':money/orders,
    'price':getorderheight(getorderprecent(i+1)).toFixed(8)*1
  }  
  order.push(pushorder)
}

let collectedmoney = 0

for(var i=0;i<order.length;i++){
  
  let isquarter = i*100/order.length;
  let firstquarter = 8
  if(isquarter < 25){
    console.log(i)
  }
  if(isquarter > 25 && isquarter < 50){
    console.log(i)
  }
  if(isquarter > 50 && isquarter < 75){
    console.log(i)
  }
  if(isquarter > 75){
    console.log(i)
  }
}


//first orders 200 at half

//avg sell price when check
//if first buy order above avg sell price use avg sell price

kasiino
guildid
check lastseenusername