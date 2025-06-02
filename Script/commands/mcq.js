module.exports.config = {
    name: "mcq",
    version: "2.5.0",
    credits: "Chitron Bhattacharjee", #don't_change_to_run_properly 
    hasPermssion: 0,
    description: "Answer quiz questions by number (1-4) to earn ৳10 (no time limit)",
    commandCategory: "Knowledge & Economy",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "request": ""
    }
};

module.exports.handleReply = async ({ api, event, handleReply, Currencies }) => {
    if (event.senderID != handleReply.author) return;
    
    const userAnswer = parseInt(event.body);
    if (isNaN(userAnswer)) return api.sendMessage("Please reply with a number (1-4)", event.threadID, event.messageID);
    if (userAnswer < 1 || userAnswer > 4) return api.sendMessage("Please choose a number between 1 and 4", event.threadID, event.messageID);
    
    const correctIndex = handleReply.correctIndex;
    const rewardAmount = 10; // ৳10 reward for correct answer
    
    if (userAnswer === correctIndex + 1) {
        // Reward user with ৳10
        await Currencies.increaseMoney(event.senderID, rewardAmount);
        
        // Get random image from API
        const res = await axios.get("https://apimyjrt.jrt-official.repl.co/naughty.php");
        const imageData = res.data.data;
        const download = (await axios.get(imageData, { responseType: "stream" })).data;
        
        api.sendMessage({
            body: `✅ Correct! The answer was ${handleReply.correctAnswer}.\n` +
                  `You earned ${rewardAmount}৳! 💸\n` +
                  `Chúc mừng bạn đã trả lời đúng!`,
            attachment: download
        }, event.threadID, event.messageID);
    } else {
        api.sendMessage(
            `❌ Wrong! The correct answer was ${handleReply.correctAnswer}`,
            event.threadID,
            event.messageID
        );
    }
    
    // Remove the reply handler
    const index = global.client.handleReply.findIndex(e => e.messageID === handleReply.messageID);
    if (index !== -1) {
        global.client.handleReply.splice(index, 1);
    }
};

module.exports.run = async ({ api, event, args, Currencies }) => {
    const axios = global.nodemodule["axios"];
    
    let difficulties = ["easy", "medium", "hard"];
    let difficulty = args[0] || difficulties[Math.floor(Math.random() * difficulties.length)];
    
    try {
        const { data } = await axios.get(`https://opentdb.com/api.php?amount=1&type=multiple&difficulty=${difficulty}`);
        
        if (!data.results || data.results.length === 0) {
            return api.sendMessage("🥴 Couldn't fetch questions - server busy", event.threadID);
        }
        
        const question = data.results[0];
        const allAnswers = [...question.incorrect_answers, question.correct_answer]
            .sort(() => Math.random() - 0.5); // Shuffle answers
        
        const correctIndex = allAnswers.indexOf(question.correct_answer);
        const correctAnswer = decodeURIComponent(question.correct_answer);
        
        let questionText = `📝 Quiz Question (Difficulty: ${difficulty})\n\n`;
        questionText += `💡 ${decodeURIComponent(question.question)}\n\n`;
        allAnswers.forEach((answer, i) => {
            questionText += `${i+1}. ${decodeURIComponent(answer)}\n`;
        });
        questionText += `\nReply with number (1-4) to answer and win 10৳!`;
        
        const message = await api.sendMessage(questionText, event.threadID);
        
        global.client.handleReply.push({
            name: "quiz",
            messageID: message.messageID,
            author: event.senderID,
            correctAnswer: correctAnswer,
            correctIndex: correctIndex,
            answerYet: 0
        });
        
    } catch (error) {
        console.error(error);
        api.sendMessage("🤡 An error occurred while fetching the question!", event.threadID);
    }
};
