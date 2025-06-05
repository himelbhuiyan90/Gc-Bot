const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "bank",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "Your Name",
    description: "ShiPu Bank PLC - Advanced Banking System",
    commandCategory: "economy",
    usages: "[-r/-d/-b/-t/-w] [amount] [@user]",
    cooldowns: 5
};

// ব্যাংক ডাটা ব্যাকআপ পাথ
const BACKUP_PATH = path.join(__dirname, 'shiPu_bank_backup.json');

// ব্যাংক ডাটা লোড/সেভ করার ফাংশন
const loadBankData = () => {
    try {
        if (fs.existsSync(BACKUP_PATH)) {
            return JSON.parse(fs.readFileSync(BACKUP_PATH));
        }
        return {};
    } catch (e) {
        console.error('Error loading bank data:', e);
        return {};
    }
};

const saveBankData = (data) => {
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(data, null, 2));
};

// Currencies-এর সাথে ব্যাংক ডাটা সিঙ্ক্রোনাইজ করার ফাংশন
const syncBankData = async (Currencies) => {
    const bankData = loadBankData();
    for (const userID in bankData) {
        await Currencies.setData(userID, {
            ...(await Currencies.getData(userID)),
            ...bankData[userID]
        });
    }
};

module.exports.run = async function({ api, event, args, Currencies }) {
    const { threadID, messageID, senderID } = event;
    const action = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);
    const targetID = Object.keys(event.mentions)[0] || args[2];

    // ব্যাংক ডাটা সিঙ্ক্রোনাইজ
    await syncBankData(Currencies);

    // হেল্পার ফাংশন
    const getUserBankData = async (userID) => {
        const userData = await Currencies.getData(userID);
        const bankData = {
            bank: userData.bank || 0,
            bankRegistered: userData.bankRegistered || false,
            lastTransaction: userData.lastTransaction || null
        };
        
        // ব্যাকআপে সেভ করুন
        const allData = loadBankData();
        allData[userID] = bankData;
        saveBankData(allData);
        
        return bankData;
    };

    const updateUserBankData = async (userID, newData) => {
        const currentData = await Currencies.getData(userID);
        const updatedData = {
            ...currentData,
            ...newData,
            lastTransaction: new Date().toISOString()
        };
        
        await Currencies.setData(userID, updatedData);
        
        // ব্যাকআপে সেভ করুন
        const allData = loadBankData();
        allData[userID] = updatedData;
        saveBankData(allData);
    };

    // অ্যাকশন ডিটেক্ট
    let actionType;
    if (['-r', 'register', 'reg'].includes(action)) actionType = 'register';
    else if (['-d', 'deposit', 'dep'].includes(action)) actionType = 'deposit';
    else if (['-b', 'balance', 'bal', 'b'].includes(action)) actionType = 'balance';
    else if (['-t', 'transfer', 'trans', 'send'].includes(action)) actionType = 'transfer';
    else if (['-w', 'withdraw', 'wd', 'with'].includes(action)) actionType = 'withdraw';
    else actionType = 'help';

    switch (actionType) {
        case 'register': {
            const userData = await getUserBankData(senderID);
            if (userData.bankRegistered) {
                return api.sendMessage("⚠️ | আপনি ইতিমধ্যেই ShiPu Bank PLC-তে রেজিস্টার্ড!", threadID, messageID);
            }
            await updateUserBankData(senderID, { 
                bankRegistered: true, 
                bank: 0,
                registrationDate: new Date().toISOString()
            });
            return api.sendMessage(
                "🏦 | ShiPu Bank PLC-তে স্বাগতম!\n" +
                "✅ | আপনার অ্যাকাউন্ট সফলভাবে রেজিস্টার্ড হয়েছে!\n" +
                "📅 | রেজিস্ট্রেশন তারিখ: " + new Date().toLocaleString(),
                threadID, messageID
            );
        }

        case 'deposit': {
            if (isNaN(amount) || amount <= 0) {
                return api.sendMessage("⚠️ | সঠিক অ্যামাউন্ট লিখুন!", threadID, messageID);
            }

            const userData = await getUserBankData(senderID);
            if (!userData.bankRegistered) {
                return api.sendMessage("⚠️ | প্রথমে রেজিস্টার করুন: bank -r", threadID, messageID);
            }

            const userMoney = await Currencies.getData(senderID);
            if (userMoney.money < amount) {
                return api.sendMessage(`⚠️ | ওয়ালেটে পর্যাপ্ত টাকা নেই! (প্রয়োজন: ${amount}$)`, threadID, messageID);
            }

            await Currencies.decreaseMoney(senderID, amount);
            await updateUserBankData(senderID, { bank: userData.bank + amount });
            
            return api.sendMessage(
                `🏦 | ShiPu Bank PLC - ডিপোজিট সফল!\n\n` +
                `💵 | ওয়ালেট: ${userMoney.money - amount}$\n` +
                `💰 | ব্যাংক ব্যালেন্স: ${userData.bank + amount}$\n` +
                `📅 | লেনদেনের সময়: ${new Date().toLocaleString()}`,
                threadID, messageID
            );
        }

        case 'withdraw': {
            if (isNaN(amount) || amount <= 0) {
                return api.sendMessage("⚠️ | সঠিক অ্যামাউন্ট লিখুন!", threadID, messageID);
            }

            const userData = await getUserBankData(senderID);
            if (!userData.bankRegistered) {
                return api.sendMessage("⚠️ | প্রথমে রেজিস্টার করুন: bank -r", threadID, messageID);
            }

            if (userData.bank < amount) {
                return api.sendMessage(`⚠️ | ব্যাংকে পর্যাপ্ত টাকা নেই! (বিদ্যমান: ${userData.bank}$)`, threadID, messageID);
            }

            await Currencies.increaseMoney(senderID, amount);
            await updateUserBankData(senderID, { bank: userData.bank - amount });
            
            return api.sendMessage(
                `🏦 | ShiPu Bank PLC - উত্তোলন সফল!\n\n` +
                `💵 | ওয়ালেট: ${(await Currencies.getData(senderID)).money}$\n` +
                `💰 | ব্যাংক ব্যালেন্স: ${userData.bank - amount}$\n` +
                `📅 | লেনদেনের সময়: ${new Date().toLocaleString()}`,
                threadID, messageID
            );
        }

        case 'balance': {
            const userData = await getUserBankData(senderID);
            if (!userData.bankRegistered) {
                return api.sendMessage("⚠️ | প্রথমে রেজিস্টার করুন: bank -r", threadID, messageID);
            }

            const userMoney = await Currencies.getData(senderID);
            return api.sendMessage(
                `🏦 | ShiPu Bank PLC - অ্যাকাউন্ট সারাংশ\n\n` +
                `👤 | গ্রাহক: ${(await api.getUserInfo(senderID))[senderID].name}\n` +
                `📅 | একাউন্ট খোলার তারিখ: ${new Date(userData.registrationDate || Date.now()).toLocaleDateString()}\n\n` +
                `💵 | ওয়ালেট ব্যালেন্স: ${userMoney.money}$\n` +
                `💰 | ব্যাংক ব্যালেন্স: ${userData.bank}$\n` +
                `📊 | মোট সম্পদ: ${userMoney.money + userData.bank}$\n\n` +
                `🔄 | সর্বশেষ লেনদেন: ${userData.lastTransaction ? new Date(userData.lastTransaction).toLocaleString() : 'N/A'}`,
                threadID, messageID
            );
        }

        case 'transfer': {
            if (isNaN(amount) || amount <= 0 || !targetID) {
                return api.sendMessage("⚠️ | ব্যবহার: bank -t <amount> @user", threadID, messageID);
            }

            const senderData = await getUserBankData(senderID);
            if (!senderData.bankRegistered) {
                return api.sendMessage("⚠️ | প্রথমে রেজিস্টার করুন: bank -r", threadID, messageID);
            }

            const targetData = await getUserBankData(targetID);
            if (!targetData.bankRegistered) {
                return api.sendMessage("⚠️ | প্রাপক ShiPu Bank PLC-তে রেজিস্টার্ড নন!", threadID, messageID);
            }

            if (senderData.bank < amount) {
                return api.sendMessage(`⚠️ | ব্যাংকে পর্যাপ্ত টাকা নেই! (বিদ্যমান: ${senderData.bank}$)`, threadID, messageID);
            }

            await updateUserBankData(senderID, { bank: senderData.bank - amount });
            await updateUserBankData(targetID, { bank: targetData.bank + amount });

            const recipientName = (await api.getUserInfo(targetID))[targetID].name;
            return api.sendMessage(
                `🏦 | ShiPu Bank PLC - ট্রান্সফার সফল!\n\n` +
                `👤 | প্রাপক: ${recipientName}\n` +
                `💸 | পরিমাণ: ${amount}$\n\n` +
                `💰 | আপনার নতুন ব্যালেন্স: ${senderData.bank - amount}$\n` +
                `📅 | লেনদেনের সময়: ${new Date().toLocaleString()}`,
                threadID, messageID
            );
        }

        default: {
            return api.sendMessage(
                `🏦 | ShiPu Bank PLC - ব্যাংকিং সিস্টেম\n\n` +
                `📌 | ব্যবহার:\n` +
                `• \`${global.config.PREFIX}bank -r\` - অ্যাকাউন্ট খুলুন\n` +
                `• \`${global.config.PREFIX}bank -d <amount>\` - টাকা জমা দিন\n` +
                `• \`${global.config.PREFIX}bank -w <amount>\` - টাকা তুলুন\n` +
                `• \`${global.config.PREFIX}bank -b\` - ব্যালেন্স চেক করুন\n` +
                `• \`${global.config.PREFIX}bank -t <amount> @user\` - টাকা পাঠান\n\n` +
                `🔒 | আপনার টাকা আমাদের কাছে নিরাপদ!`,
                threadID, messageID
            );
        }
    }
};

// বট রিস্টার্ট হলে ডাটা সিঙ্ক্রোনাইজ
module.exports.onLoad = async ({ Currencies }) => {
    await syncBankData(Currencies);
    console.log('ShiPu Bank PLC - ব্যাংক ডাটা সিঙ্ক্রোনাইজড');
};
