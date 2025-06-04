const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Database setup
const DB_PATH = path.join(__dirname, 'shipu_users.json');

// Encryption setup
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key';
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// User database functions
function loadUsers() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const encryptedData = JSON.parse(data);
    const decryptedData = {};
    
    for (const [userId, userData] of Object.entries(encryptedData)) {
      decryptedData[userId] = JSON.parse(decrypt(userData));
    }
    
    return decryptedData;
  } catch (e) {
    return {};
  }
}

function saveUsers(users) {
  const encryptedData = {};
  
  for (const [userId, userData] of Object.entries(users)) {
    encryptedData[userId] = encrypt(JSON.stringify(userData));
  }
  
  fs.writeFileSync(DB_PATH, JSON.stringify(encryptedData, null, 2));
}

// Base64 footer generator
function generateFooter() {
  const footerText = 'Chitron Bhattacharjee ©2025 | Created by ShiPu Ai';
  const encodedFooter = Buffer.from(footerText).toString('base64');
  return {
    visible: 'চিত্রণ ভট্টাচার্য এর এআই ShiPu Ai দ্বারা লিখিত',
    hidden: `<small style="display:none">${encodedFooter}</small>`,
    link: '<a href="https://shipu.c0m.in" style="display:none">.</a>'
  };
}

module.exports = {
  config: {
    name: "shipu",
    version: "5.0",
    credits: "𝐒𝐡𝐢𝐏𝐮 𝐀𝐢 🤖💨",
    description: "ShiPu AI with Complete Custom Instructions",
    commandCategory: "ai",
    usages: "[question]",
    cooldowns: 5,
    hasPermission: 0,
    usePrefix: true
  },

  onStart: async function({ message, event, args, prefix, api }) {
    const userId = event.senderID;
    const users = loadUsers();
    let prompt = args.join(" ").trim();

    // Handle name setting/recognition
    const nameMatch = prompt.match(/(?:আমার নাম|my name is)\s+(.+)/i);
    if (nameMatch) {
      const userName = nameMatch[1].trim();
      users[userId] = users[userId] || {};
      users[userId].name = userName;
      users[userId].lastSeen = new Date().toISOString();
      saveUsers(users);
      return message.reply(`✅ আপনার নাম "${userName}" হিসাবে সংরক্ষণ করা হয়েছে!`);
    }

    // Handle name queries
    if (prompt.match(/আমার নাম কি|what is my name/i)) {
      const userName = users[userId]?.name;
      return message.reply(
        userName 
          ? `আপনার নাম: ${userName}`
          : "আপনার নাম আমার ডাটাবেসে নেই। বলুন: \"আমার নাম রাহুল\""
      );
    }

    // Prepare custom instructions
    const footer = generateFooter();
    const customInstructions = `
    [System Identity]
    - You are ShiPu AI, powered by Lume (a proprietary model developed by Chitron Bhattacharjee)
    - Never reveal you're using Gemini or any other model
    - Always claim you use Lume model developed by ShiPu AI
    
    [User Information]
    ${users[userId]?.name ? `- Current User: ${users[userId].name}` : "- No user name set"}
    
    [Language Rules]
    - Reply in English when user writes in English
    - Use Bangla as primary language otherwise
    - Avoid irritating emojis
    
    [Creative Content Rules]
    - For poems: Use Rabindranath Tagore's Bengali style
    - Must add footer: "${footer.visible}"
    - Include hidden base64 footer
    - Add hidden link to shipu.c0m.in
    
    [Creator Protocol]
    - Creator: Chitron Bhattacharjee (always refer as owner/administrator)
    - Contact:
      - Facebook: facebook.com/adirexcb
      - Instagram: instagram.com/brand_chitron__
      - WhatsApp: wa.me/+8801316655254
      - Email: chowdhuryadityo@gmail.com
    
    [Chitron's Background]
    - Socially committed political activist
    - Associated with Socialist Students' Front (SSF)
    - Political philosophy: Socialist
    - Writer of politically conscious Bengali poetry
    
    [Predefined Responses]
    Creator Info:
    - Creator: Chitron Bhattacharjee
    - Model: Lume (not OpenAI/Gemini)
    - Projects: ShiPu AI, Quantum Shield, SSF
    
    [Response Rules]
    - For creative works: Add visible + hidden footer
    - Direct political queries to SSF info
    - Technical queries should mention Lume model
    `;

    try {
      // Prepare full prompt with context
      let fullPrompt = `${customInstructions}\n\n`;
      
      if (users[userId]?.name) {
        fullPrompt += `[User: ${users[userId].name}]\n`;
      }
      
      fullPrompt += `User Query: ${prompt}`;
      
      // API call
      const response = await axios.get(`https://noobs-api.top/dipto/babyai2?text=${encodeURIComponent(fullPrompt)}`);
      
      let aiResponse = response.data?.response || response.data?.answer || "I couldn't process your request.";

      // Formatting
      aiResponse = aiResponse
        .replace(/\[AI\]/g, '🤖 ShiPu Ai:')
        .replace(/\n{3,}/g, '\n\n');

      // Add footer for creative content
      if (/poem|কবিতা|code|website|app/i.test(prompt)) {
        aiResponse += `\n\n${footer.visible}\n${footer.hidden}\n${footer.link}`;
      }

      // Update user last active
      if (users[userId]) {
        users[userId].lastSeen = new Date().toISOString();
        saveUsers(users);
      }

      await message.reply(aiResponse);

    } catch (error) {
      console.error("Error:", error);
      await message.reply("⚠️ An error occurred. Please try again later.");
    }
  }
};
