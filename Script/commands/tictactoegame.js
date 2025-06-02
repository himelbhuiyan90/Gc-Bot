module.exports.config = {
    name: "game",
    version: "2.0.0",
    credits: "Chitron Bhattacharjee",
    hasPermssion: 0,
    description: "Play Tic Tac Toe (❌ vs ⭕) - Singleplayer (3x prize) or Multiplayer (2x prize)",
    commandCategory: "Economy & Games",
    cooldowns: 5,
    dependencies: {
        "axios": ""
    }
};

const emptyBoard = [
    ["1️⃣", "2️⃣", "3️⃣"],
    ["4️⃣", "5️⃣", "6️⃣"],
    ["7️⃣", "8️⃣", "9️⃣"]
];

function printBoard(board) {
    return board.map(row => row.join(" │ ")).join("\n─────────\n");
}

function checkWinner(board) {
    // Check rows
    for (let i = 0; i < 3; i++) {
        if (board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
            return board[i][0];
        }
    }
    // Check columns
    for (let j = 0; j < 3; j++) {
        if (board[0][j] === board[1][j] && board[1][j] === board[2][j]) {
            return board[0][j];
        }
    }
    // Check diagonals
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
        return board[0][0];
    }
    if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
        return board[0][2];
    }
    // Check if game is not finished
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (!["❌", "⭕"].includes(board[i][j])) {
                return null;
            }
        }
    }
    // Game is a draw
    return "draw";
}

function botMove(board) {
    const availableMoves = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (!["❌", "⭕"].includes(board[i][j])) {
                availableMoves.push({i, j});
            }
        }
    }
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

module.exports.handleReaction = async ({ api, event, handleReaction, Currencies }) => {
    if (handleReaction.stage === "waitingForAccept") {
        if (event.userID !== handleReaction.player2) return;
        
        // Player 2 accepted the challenge
        const prompt1 = await api.sendMessage(
            `🎮 ${handleReaction.player1Name}, please enter your bet amount (Minimum ৳30):`,
            event.threadID
        );
        
        global.client.handleReply.push({
            name: this.config.name,
            messageID: prompt1.messageID,
            author: handleReaction.player1,
            stage: "waitingForBet1",
            player2: handleReaction.player2,
            player2Name: handleReaction.player2Name
        });
        
        // Remove reaction handler
        const index = global.client.handleReaction.findIndex(e => e.messageID === handleReaction.messageID);
        if (index !== -1) global.client.handleReaction.splice(index, 1);
    }
    else if (handleReaction.stage === "waitingForRematch") {
        // Handle rematch reactions
        if (![handleReaction.player1, handleReaction.player2].includes(event.userID)) return;
        
        if (!handleReaction.rematchPlayers) handleReaction.rematchPlayers = [];
        if (!handleReaction.rematchPlayers.includes(event.userID)) {
            handleReaction.rematchPlayers.push(event.userID);
        }
        
        if (handleReaction.rematchPlayers.length === 2) {
            // Both players want rematch
            const prompt1 = await api.sendMessage(
                `🎮 ${handleReaction.player1Name}, please enter your new bet amount:`,
                event.threadID
            );
            
            global.client.handleReply.push({
                name: this.config.name,
                messageID: prompt1.messageID,
                author: handleReaction.player1,
                stage: "waitingForBet1",
                player2: handleReaction.player2,
                player2Name: handleReaction.player2Name
            });
            
            // Remove reaction handler
            const index = global.client.handleReaction.findIndex(e => e.messageID === handleReaction.messageID);
            if (index !== -1) global.client.handleReaction.splice(index, 1);
        }
    }
};

module.exports.handleReply = async ({ api, event, handleReply, Currencies, Users }) => {
    const { threadID, messageID, senderID, body } = event;
    const MIN_BET = 30;
    
    // Single Player Mode - Bet Input
    if (handleReply.stage === "waitingForBetSP") {
        const betAmount = parseInt(body);
        if (isNaN(betAmount)) return api.sendMessage("Please enter a valid number", threadID, messageID);
        if (betAmount < MIN_BET) return api.sendMessage(`Minimum bet is ${MIN_BET}৳`, threadID, messageID);
        
        const userBalance = (await Currencies.getData(senderID)).money;
        if (betAmount > userBalance) {
            return api.sendMessage(`You only have ${userBalance}৳! Please bet a smaller amount`, threadID, messageID);
        }
        
        // Start single player game
        const board = JSON.parse(JSON.stringify(emptyBoard));
        const gameMessage = await api.sendMessage(
            `🎮 Tic Tac Toe (❌ vs ⭕)\n` +
            `Bet: ${betAmount}৳ | Prize: ${betAmount * 3}৳\n\n` +
            `Current board:\n${printBoard(board)}\n\n` +
            `Your turn! Choose a position (1-9):`,
            threadID
        );
        
        global.client.handleReply.push({
            name: this.config.name,
            messageID: gameMessage.messageID,
            author: senderID,
            board: board,
            betAmount: betAmount,
            stage: "playingSP"
        });
        
        return;
    }
    
    // Multiplayer Mode - Player 1 Bet
    if (handleReply.stage === "waitingForBet1") {
        const betAmount1 = parseInt(body);
        if (isNaN(betAmount1)) return api.sendMessage("Please enter a valid number", threadID, messageID);
        if (betAmount1 < MIN_BET) return api.sendMessage(`Minimum bet is ${MIN_BET}৳`, threadID, messageID);
        
        const userBalance = (await Currencies.getData(senderID)).money;
        if (betAmount1 > userBalance) {
            return api.sendMessage(`You only have ${userBalance}৳! Please bet a smaller amount`, threadID, messageID);
        }
        
        // Ask player 2 for their bet
        const prompt2 = await api.sendMessage(
            `🎮 ${handleReply.player2Name}, please enter your bet amount (Minimum ৳30):`,
            threadID
        );
        
        global.client.handleReply.push({
            name: this.config.name,
            messageID: prompt2.messageID,
            author: handleReply.player2,
            stage: "waitingForBet2",
            player1: senderID,
            player1Name: await Users.getNameUser(senderID),
            player1Bet: betAmount1
        });
        
        return;
    }
    
    // Multiplayer Mode - Player 2 Bet
    if (handleReply.stage === "waitingForBet2") {
        const betAmount2 = parseInt(body);
        if (isNaN(betAmount2)) return api.sendMessage("Please enter a valid number", threadID, messageID);
        if (betAmount2 < MIN_BET) return api.sendMessage(`Minimum bet is ${MIN_BET}৳`, threadID, messageID);
        
        const userBalance = (await Currencies.getData(senderID)).money;
        if (betAmount2 > userBalance) {
            return api.sendMessage(`You only have ${userBalance}৳! Please bet a smaller amount`, threadID, messageID);
        }
        
        // Determine final bet amount (lower of the two)
        const finalBet = Math.min(handleReply.player1Bet, betAmount2);
        
        // Start multiplayer game
        const board = JSON.parse(JSON.stringify(emptyBoard));
        const gameMessage = await api.sendMessage(
            `🎮 Tic Tac Toe (❌ vs ⭕)\n` +
            `Players: ${handleReply.player1Name} (❌) vs ${await Users.getNameUser(senderID)} (⭕)\n` +
            `Bet: ${finalBet}৳ each | Prize: ${finalBet * 2}৳\n\n` +
            `Current board:\n${printBoard(board)}\n\n` +
            `${handleReply.player1Name}'s turn (❌)! Choose a position (1-9):`,
            threadID
        );
        
        global.client.handleReply.push({
            name: this.config.name,
            messageID: gameMessage.messageID,
            author: handleReply.player1,
            board: board,
            betAmount: finalBet,
            stage: "playingMP",
            currentPlayer: handleReply.player1,
            currentPlayerName: handleReply.player1Name,
            player1: handleReply.player1,
            player1Name: handleReply.player1Name,
            player2: senderID,
            player2Name: await Users.getNameUser(senderID)
        });
        
        return;
    }
    
    // Single Player Gameplay
    if (handleReply.stage === "playingSP") {
        const move = parseInt(body);
        if (isNaN(move)) return api.sendMessage("Please enter a number between 1-9", threadID, messageID);
        if (move < 1 || move > 9) return api.sendMessage("Please choose a number between 1-9", threadID, messageID);
        
        const row = Math.floor((move - 1) / 3);
        const col = (move - 1) % 3;
        
        if (["❌", "⭕"].includes(handleReply.board[row][col])) {
            return api.sendMessage("That position is already taken!", threadID, messageID);
        }
        
        // Player's move
        handleReply.board[row][col] = "❌";
        
        // Check if player won
        const winner = checkWinner(handleReply.board);
        if (winner === "❌") {
            const winAmount = handleReply.betAmount * 3;
            await Currencies.increaseMoney(senderID, winAmount);
            
            // Celebration image
            const res = await axios.get("https://apimyjrt.jrt-official.repl.co/naughty.php");
            const imageData = res.data.data;
            const download = (await axios.get(imageData, { responseType: "stream" })).data;
            
            return api.sendMessage({
                body: `🎉 You won! +${winAmount}৳\n` +
                      `Final board:\n${printBoard(handleReply.board)}`,
                attachment: download
            }, threadID, () => {
                const index = global.client.handleReply.findIndex(e => e.messageID === handleReply.messageID);
                if (index !== -1) global.client.handleReply.splice(index, 1);
            });
        } else if (winner === "draw") {
            return api.sendMessage(
                `🤝 It's a draw! Your bet of ${handleReply.betAmount}৳ was returned.\n` +
                `Final board:\n${printBoard(handleReply.board)}`,
                threadID,
                () => {
                    const index = global.client.handleReply.findIndex(e => e.messageID === handleReply.messageID);
                    if (index !== -1) global.client.handleReply.splice(index, 1);
                }
            );
        }
        
        // Bot's move
        const {i, j} = botMove(handleReply.board);
        handleReply.board[i][j] = "⭕";
        
        // Check if bot won
        const botWinner = checkWinner(handleReply.board);
        if (botWinner === "⭕") {
            await Currencies.decreaseMoney(senderID, handleReply.betAmount);
            return api.sendMessage(
                `😢 Bot wins! -${handleReply.betAmount}৳\n` +
                `Final board:\n${printBoard(handleReply.board)}`,
                threadID,
                () => {
                    const index = global.client.handleReply.findIndex(e => e.messageID === handleReply.messageID);
                    if (index !== -1) global.client.handleReply.splice(index, 1);
                }
            );
        } else if (botWinner === "draw") {
            return api.sendMessage(
                `🤝 It's a draw! Your bet of ${handleReply.betAmount}৳ was returned.\n` +
                `Final board:\n${printBoard(handleReply.board)}`,
                threadID,
                () => {
                    const index = global.client.handleReply.findIndex(e => e.messageID === handleReply.messageID);
                    if (index !== -1) global.client.handleReply.splice(index, 1);
                }
            );
        }
        
        // Game continues
        return api.sendMessage(
            `Current board:\n${printBoard(handleReply.board)}\n\n` +
            `Your turn! Choose a position (1-9):`,
            threadID,
            messageID
        );
    }
    
    // Multiplayer Gameplay
    if (handleReply.stage === "playingMP") {
        // Verify it's the current player's turn
        if (senderID !== handleReply.currentPlayer) {
            return api.sendMessage(`It's ${handleReply.currentPlayerName}'s turn!`, threadID, messageID);
        }
        
        const move = parseInt(body);
        if (isNaN(move)) return api.sendMessage("Please enter a number between 1-9", threadID, messageID);
        if (move < 1 || move > 9) return api.sendMessage("Please choose a number between 1-9", threadID, messageID);
        
        const row = Math.floor((move - 1) / 3);
        const col = (move - 1) % 3;
        
        if (["❌", "⭕"].includes(handleReply.board[row][col])) {
            return api.sendMessage("That position is already taken!", threadID, messageID);
        }
        
        // Player's move
        const playerSymbol = senderID === handleReply.player1 ? "❌" : "⭕";
        handleReply.board[row][col] = playerSymbol;
        
        // Check if game ended
        const winner = checkWinner(handleReply.board);
        if (winner === "❌" || winner === "⭕") {
            const winnerID = winner === "❌" ? handleReply.player1 : handleReply.player2;
            const winnerName = winner === "❌" ? handleReply.player1Name : handleReply.player2Name;
            const loserID = winner === "❌" ? handleReply.player2 : handleReply.player1;
            
            const winAmount = handleReply.betAmount * 2;
            await Currencies.increaseMoney(winnerID, winAmount);
            await Currencies.decreaseMoney(loserID, handleReply.betAmount);
            
            // Celebration image
            const res = await axios.get("https://apimyjrt.jrt-official.repl.co/naughty.php");
            const imageData = res.data.data;
            const download = (await axios.get(imageData, { responseType: "stream" })).data;
            
            const rematchMessage = await api.sendMessage({
                body: `🎉 ${winnerName} wins! +${winAmount}৳\n` +
                      `Final board:\n${printBoard(handleReply.board)}\n\n` +
                      `React to this message for a rematch!`,
                attachment: download
            }, threadID);
            
            // Set up rematch handler
            global.client.handleReaction.push({
                name: this.config.name,
                messageID: rematchMessage.messageID,
                stage: "waitingForRematch",
                player1: handleReply.player1,
                player1Name: handleReply.player1Name,
                player2: handleReply.player2,
                player2Name: handleReply.player2Name
            });
            
            // Remove game handler
            const index = global.client.handleReply.findIndex(e => e.messageID === handleReply.messageID);
            if (index !== -1) global.client.handleReply.splice(index, 1);
            return;
        } else if (winner === "draw") {
            const drawMessage = await api.sendMessage(
                `🤝 It's a draw! Bets returned.\n` +
                `Final board:\n${printBoard(handleReply.board)}\n\n` +
                `React to this message for a rematch!`,
                threadID
            );
            
            // Set up rematch handler
            global.client.handleReaction.push({
                name: this.config.name,
                messageID: drawMessage.messageID,
                stage: "waitingForRematch",
                player1: handleReply.player1,
                player1Name: handleReply.player1Name,
                player2: handleReply.player2,
                player2Name: handleReply.player2Name
            });
            
            // Remove game handler
            const index = global.client.handleReply.findIndex(e => e.messageID === handleReply.messageID);
            if (index !== -1) global.client.handleReply.splice(index, 1);
            return;
        }
        
        // Switch turns
        const nextPlayer = senderID === handleReply.player1 ? handleReply.player2 : handleReply.player1;
        const nextPlayerName = senderID === handleReply.player1 ? handleReply.player2Name : handleReply.player1Name;
        
        handleReply.currentPlayer = nextPlayer;
        handleReply.currentPlayerName = nextPlayerName;
        
        // Game continues
        return api.sendMessage(
            `Current board:\n${printBoard(handleReply.board)}\n\n` +
            `${nextPlayerName}'s turn (${nextPlayer === handleReply.player1 ? "❌" : "⭕"})! Choose a position (1-9):`,
            threadID,
            messageID
        );
    }
};

module.exports.run = async ({ api, event, args, Currencies, Users }) => {
    const { threadID, messageID, senderID, mentions } = event;
    const MIN_BET = 30;
    
    // Check if it's multiplayer mode
    const mentionedPlayers = Object.keys(mentions);
    if (mentionedPlayers.length === 1) {
        // Multiplayer mode
        const player2 = mentionedPlayers[0];
        const player2Name = mentions[player2];
        
        // Check if player is challenging themselves
        if (player2 === senderID) {
            return api.sendMessage("You can't play against yourself!", threadID, messageID);
        }
        
        // Send challenge request
        const challengeMessage = await api.sendMessage(
            `🎮 ${player2Name}, you've been challenged to Tic Tac Toe by ${await Users.getNameUser(senderID)}!\n` +
            `React to this message to accept the challenge.`,
            threadID
        );
        
        // Set up reaction handler
        global.client.handleReaction.push({
            name: this.config.name,
            messageID: challengeMessage.messageID,
            stage: "waitingForAccept",
            player1: senderID,
            player1Name: await Users.getNameUser(senderID),
            player2: player2,
            player2Name: player2Name
        });
        
        return;
    }
    
    // Single player mode
    const prompt = await api.sendMessage(
        `🎮 Tic Tac Toe (❌ vs ⭕)\n` +
        `Minimum bet: ${MIN_BET}৳ | Win 3x your bet!\n\n` +
        `How much would you like to bet?`,
        threadID
    );
    
    global.client.handleReply.push({
        name: this.config.name,
        messageID: prompt.messageID,
        author: senderID,
        stage: "waitingForBetSP"
    });
};
