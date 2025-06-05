module.exports.config = {
    name: "mcq",
    version: "5.0.0",
    credits: "Chitron Bhattacharjee",
    aliases: ["quiz", "qsn", "ans"],
    hasPermssion: 0,
    description: "Interactive MCQ Quiz with Statistics Tracking",
    commandCategory: "Education",
    cooldowns: 5,
    dependencies: { "axios": "" },
    prefix: true, // This enables global prefix support
    usage: "{prefix}mcq [easy/medium/hard]"
};

// Store user statistics globally
const userStats = new Map();

module.exports.handleReply = async ({ api, event, handleReply, Currencies }) => {
    if (event.senderID !== handleReply.author) return;

    // Initialize user stats if not exists
    if (!userStats.has(event.senderID)) {
        userStats.set(event.senderID, {
            totalQuestions: 0,
            correctAnswers: 0,
            totalEarned: 0,
            sessionStart: new Date()
        });
    }
    
    const stats = userStats.get(event.senderID);

    // Flexible answer parsing (1/a/A/Dhaka)
    const userInput = event.body.trim().toLowerCase();
    let userAnswer;
    
    if (/^[1-4]$/.test(userInput)) {
        userAnswer = parseInt(userInput) - 1;
    } else if (/^[a-d]$/.test(userInput)) {
        userAnswer = userInput.charCodeAt(0) - 97; // a=0, b=1, etc.
    } else {
        // Match by answer text (case-insensitive)
        userAnswer = handleReply.answers.findIndex(
            ans => ans.toLowerCase() === userInput
        );
    }

    // Validate answer
    if (userAnswer === -1 || isNaN(userAnswer)) {
        return api.sendMessage("❌ Invalid input! Reply with 1-4, a-d, or answer text.", event.threadID);
    }

    const isCorrect = userAnswer === handleReply.correctIndex;
    const rewardAmount = 20;
    stats.totalQuestions++;

    // Update stats if correct
    if (isCorrect) {
        stats.correctAnswers++;
        stats.totalEarned += rewardAmount;
        await Currencies.increaseMoney(event.senderID, rewardAmount);
    }

    // Generate styled result
    let resultMessage = `📘 *${handleReply.question}*\n\n`;
    handleReply.answers.forEach((ans, i) => {
        const prefix = i === handleReply.correctIndex ? "✅" : 
                      i === userAnswer ? "❌" : "  ";
        resultMessage += `${prefix} ${String.fromCharCode(65+i)}. ${ans}\n`;
    });

    resultMessage += `――――――――――――――――――――――――\n` +
                     `${isCorrect ? "🎉 Correct!" : "🚫 Wrong!"} ` +
                     `Answer: (${String.fromCharCode(65+handleReply.correctIndex)}) ` +
                     `${handleReply.answers[handleReply.correctIndex]}\n\n` +
                     `💰 +${isCorrect ? rewardAmount : 0}৳ added to your balance\n` +
                     `📊 Session Stats: ${stats.correctAnswers}/${stats.totalQuestions} correct\n` +
                     `💵 Total earned: ${stats.totalEarned}৳\n\n` +
                     `🔁 React with any emoji to continue to the next question`;

    api.sendMessage(resultMessage, event.threadID, (err, info) => {
        if (!err) {
            // Add reaction and set up handler for next question
            api.setMessageReaction("❤️", info.messageID, (err) => {}, true);
            
            // Remove old reply handler
            const index = global.client.handleReply.findIndex(e => e.messageID === handleReply.messageID);
            if (index !== -1) global.client.handleReply.splice(index, 1);
            
            // Add new reaction handler
            global.client.handleReaction.push({
                name: this.config.name,
                messageID: info.messageID,
                author: event.senderID,
                difficulty: handleReply.difficulty,
                currencies: Currencies,
                stats: stats
            });
        }
    });
};

module.exports.handleReaction = async ({ api, event, handleReaction }) => {
    if (event.userID !== handleReaction.author) return;
    
    // Remove reaction handler
    const index = global.client.handleReaction.findIndex(e => e.messageID === handleReaction.messageID);
    if (index !== -1) global.client.handleReaction.splice(index, 1);
    
    // Start new question with same difficulty
    await this.run({
        api: api,
        event: event,
        args: [handleReaction.difficulty],
        Currencies: handleReaction.currencies
    });
};

module.exports.run = async ({ api, event, args, Currencies }) => {
    try {
        // Check if this is a new session
        if (!userStats.has(event.senderID)) {
            userStats.set(event.senderID, {
                totalQuestions: 0,
                correctAnswers: 0,
                totalEarned: 0,
                sessionStart: new Date()
            });
        }

        const difficulties = ["easy", "medium", "hard"];
        const difficulty = args[0]?.toLowerCase() || difficulties[Math.floor(Math.random() * difficulties.length)];

        // Validate difficulty
        if (!difficulties.includes(difficulty)) {
            return api.sendMessage(`Please specify a valid difficulty:\n${difficulties.join(", ")}`, event.threadID);
        }

        const { data } = await axios.get(`https://opentdb.com/api.php?amount=1&type=multiple&difficulty=${difficulty}`);
        
        if (!data.results?.length)) {
            return api.sendMessage("🔴 Quiz API is currently unavailable. Try again later!", event.threadID);
        }

        const question = data.results[0];
        const answers = [...question.incorrect_answers, question.correct_answer]
                      .sort(() => Math.random() - 0.5)
                      .map(a => decodeURIComponent(a));
        
        const correctIndex = answers.indexOf(decodeURIComponent(question.correct_answer));
        const questionText = decodeURIComponent(question.question);

        // Stylish question format
        let quizMessage = `📘 *Question • ${questionText}*\n\n`;
        answers.forEach((ans, i) => {
            quizMessage += `   ${String.fromCharCode(0x1F150 + i)} ${ans}\n`;
        });
        quizMessage += "――――――――――――――――――――――――\n" +
                      "💡 Reply with 1-4, a-d, or answer text";

        const msg = await api.sendMessage(quizMessage, event.threadID);
        
        global.client.handleReply.push({
            name: this.config.name,
            messageID: msg.messageID,
            author: event.senderID,
            question: `Question • ${questionText}`,
            answers: answers,
            correctIndex: correctIndex,
            difficulty: difficulty
        });

    } catch (error) {
        console.error(error);
        api.sendMessage("❌ Failed to load quiz question. Please try again!", event.threadID);
    }
};
