module.exports.config = {
	name: "banking",
	version: "1.0.1",
	hasPermssion: 0,
	credits: "D-Jukie",
	description: "Deposit money into LumeTech Bank Co. with interest",
	commandCategory: "Economy",
	usages: "bank",
	cooldowns: 5
};

module.exports.onLoad = async () => {
	const { existsSync, writeFileSync, mkdirSync } = require("fs-extra")
	const { join } = require("path")
	const axios = require("axios");
	const dir = __dirname + `/banking`;
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const pathData = join(__dirname + '/banking/banking.json');
    if (!existsSync(pathData)) return writeFileSync(pathData, "[]", "utf-8"); 
	return;
}

module.exports.run = async function({ api, event, args, models, Users, Threads, Currencies, permssion }) {
  const { threadID, messageID, senderID } = event;
  const { readFileSync, writeFileSync } = require("fs-extra")
  const { join } = require("path")
  const pathData = join(__dirname + '/banking/banking.json');
  const user = require('./banking/banking.json');
  const timeIM = 60*20
  const interestRate = 0.05
  const moneyInput = parseInt(args[1])
  
  if(args[0] == '-r' || args[0] == 'register') {
    if (!user.find(i => i.senderID == senderID)) {
      var add = { senderID: senderID,  money: 0 }
      user.push(add);
      writeFileSync(pathData, JSON.stringify(user, null, 2));
      return api.sendMessage(`[ SUCCESS ] » You've successfully registered at LumeTech Bank Co.💰\nMinimum deposit: $1,000,000 to earn interest`, threadID, messageID)
    }
    else return api.sendMessage(`[ WARNING ] » You already have an account with LumeTech Bank Co.🏦`, threadID, messageID)
  }
  
  if(args[0] == 'balance' || args[0] == 'bal' || args[0] == 'check' || args[0] == 'coins') {
    if (!user.find(i => i.senderID == senderID)) return api.sendMessage('[ WARNING ] » You need to register first (banking register) to use LumeTech Bank Co. services🏦', threadID, messageID)
    else { 
      var userData = user.find(i => i.senderID == senderID);
      return api.sendMessage(`[ SUCCESS ] » Your LumeTech Bank Co. balance: $${userData.money}\n💷 Interest rate: +${interestRate*100}% every ${timeIM/60} minutes`, threadID, messageID)
    }
  } 
  
  if(args[0] == 'deposit' || args[0] == 'send') {
    if (!args[1] || isNaN(args[1]) || parseInt(args[1]) < 100) return api.sendMessage("[ WARNING ] » Minimum deposit amount is $100💰", threadID, messageID);
    if (!user.find(i => i.senderID == senderID)) {
      return api.sendMessage('[ WARNING ] » Please register first (banking register) to use LumeTech Bank Co. services💰', threadID, messageID)
    }
    else { 
      let balance = (await Currencies.getData(senderID)).money;
      if(balance < moneyInput) return api.sendMessage(`[ WARNING ] » Insufficient balance (Need $${moneyInput}) for this transaction💰`, threadID, messageID)
      var userData = user.find(i => i.senderID == senderID);
      userData.money = parseInt(userData.money) + parseInt(moneyInput)
      writeFileSync(pathData, JSON.stringify(user, null, 2));
      await Currencies.decreaseMoney(senderID, parseInt(moneyInput));
      return api.sendMessage(`[ SUCCESS ] » Deposited $${moneyInput} to LumeTech Bank Co.\n💷 Interest rate: +${interestRate*100}% every ${timeIM/60} minutes`, threadID, messageID)
    }
  }
  
  if(args[0] == 'withdraw' || args[0] == 'get') { 
    if (!args[1] || isNaN(args[1]) || parseInt(args[1]) < 1000) return api.sendMessage("[ WARNING ] » Minimum withdrawal amount is $1,000", threadID, messageID);
    if (!user.find(i => i.senderID == senderID)) {
      return api.sendMessage('[ WARNING ] » Please register first (banking register) to use LumeTech Bank Co. services', threadID, messageID)
    }
    else {  
      var userData = user.find(i => i.senderID == senderID); 
      if(parseInt(userData.money) < parseInt(moneyInput)) return api.sendMessage('[ WARNING ] » Insufficient bank balance for this transaction!', threadID, messageID)
      else {
        await Currencies.increaseMoney(senderID, parseInt(moneyInput));
        userData.money = parseInt(userData.money) - parseInt(moneyInput)
        writeFileSync(pathData, JSON.stringify(user, null, 2));
        return api.sendMessage(`[ SUCCESS ] » Withdrew $${parseInt(moneyInput)}, remaining balance: $${userData.money}`, threadID, messageID)
      }
    }
  }
  
  else return api.sendMessage(`=====🏦 LumeTech Bank Co. 🏦=====\n\n[-r/register] - Register for banking services💹\n[check/coins/balance/bal] - Check your bank balance💳\n[deposit/send] - Deposit money💷\n[withdraw] - Withdraw money💰\n\n💲 Current interest rate: +${interestRate*100}% every ${timeIM/60} minutes`, threadID, messageID)
}
