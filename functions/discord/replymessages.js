

function replymessageclass(){
  this.helpmessage = '```'+///////!help
  '!help: Kuvab k6ik commandid; \n'+
  '!addtrail [user] [votes(inf)]: lisab kasutaja vote traili antud arv votedeks; \n'+
  '!cleartrail: puhastab k6ik inimesed trailist \n'+
  '!vp [user, user2]: Näitab kõike vpga seoses \n'+
  '!send [valuuta] [kogus] [kasutaja]: Saadab valitud valuutat \n'+
  '!powerup [kogus]: powerupib summa \n'+
  '!listcoin : kuvab kõik coin collectionid \n' +
  '!lisacoin [coini nimi]: lisab coini kollektsiooni \n'+
  '!eemaldacoin [coini nimi]: eemaldab coini kollektsiooni \n'+
  '!editbaseentry [coini nimi] [pair/type/price] [value]: muuudab baas sissekannet \n'+
  '!newtrade [coin] [kogus] [entry price]: Lisab trade andmebaasi \n'+
  '!closetrade [coin] [id] [exit price]: sulgeb trade \n'+
  '!coininfo [coin] [open/close/all]: Kuvab coini traded \n'+
  '```';
  this.commandnihu = 'Midagi läks commandiga nihu';
}

module.exports = {
  replymessageclass
}



