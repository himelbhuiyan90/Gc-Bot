module.exports.config = {
  name: "invite",
  version: "6.0.0",
  hasPermssion: 2,
  credits: "Chitron Bhattacharjee",
  description: "Advanced invitation system with auto-friend and messaging",
  commandCategory: "Admin",
  usages: "invite uid text group_cid",
  cooldowns: 20,
  dependencies: {
    "fs-extra": "",
    "message-cache": ""
  }
};

const pendingInvites = new Map();

// Enhanced auto-friend and welcome system
module.exports.onEvent = async function({ api, event, config }) {
  try {
    // Auto-accept all friend requests
    if (event.type === "friend_request") {
      const requesterID = event.senderID;
      
      // Accept friend request
      await api.handleFriendRequest(requesterID, true);
      
      // Prepare welcome message with bot ID
      const welcomeMessage = `🤖 Bot Connected Successfully!\n\n` +
                           `Thank you for adding me!\n` +
                           `My ID: ${api.getCurrentUserID()}\n\n` +
                           `You can now:\n` +
                           `• Receive group invitations\n` +
                           `• Use my services in groups\n` +
                           `• Message me anytime`;
      
      // Try to send welcome message
      try {
        await api.sendMessage(welcomeMessage, requesterID);
      } catch (dmError) {
        // Fallback to m.me link if DM fails
        const mmeLink = `https://m.me/${requesterID}`;
        console.log(`DM failed, fallback to: ${mmeLink}`);
        
        // Notify admin about the failure
        await api.sendMessage(
          `⚠️ Couldn't DM new friend ${requesterID}\n` +
          `Please contact them via: ${mmeLink}`,
          event.threadID
        ).catch(console.error);
      }
    }

    // Handle invitation acceptance via reaction/reply
    if (event.type === "message_reaction" || event.type === "message_reply") {
      const inviteData = pendingInvites.get(event.messageID);
      if (!inviteData) return;

      const { groupId, inviterId } = inviteData;
      const userId = event.senderID;

      try {
        // Attempt to add to group
        await api.addUserToGroup(userId, groupId);
        
        // Success notification to group
        await api.sendMessage(
          `✅ @${userId} has joined the group via invitation!`,
          groupId
        );
        
        // Success message to user
        await api.sendMessage(
          `🎉 Thanks for accepting the invitation!\n\n` +
          `You've been successfully added to the group.\n` +
          `Enjoy your stay!`,
          userId
        );
        
      } catch (addError) {
        console.error("Add failed:", addError);
        
        // Fallback: Get group invite link
        try {
          const groupInfo = await api.getThreadInfo(groupId);
          const inviteLink = groupInfo.inviteLink || 
                           `https://m.me/join/${groupId}`;
          
          // Send fallback invite link
          await api.sendMessage(
            `📨 Couldn't add you automatically\n\n` +
            `Please join using this link:\n${inviteLink}\n\n` +
            `Or ask the admin (@${inviterId}) to add you.`,
            userId
          );
          
          // Notify admin
          await api.sendMessage(
            `⚠️ Failed to auto-add @${userId}\n` +
            `Sent them invite link instead.\n` +
            `Group: ${groupId}`,
            inviterId
          );
        } catch (linkError) {
          console.error("Failed to send invite link:", linkError);
        }
      } finally {
        pendingInvites.delete(event.messageID);
      }
    }
  } catch (e) {
    console.error("Event handler error:", e);
  }
};

module.exports.run = async function({ api, event, args, config }) {
  const { threadID, messageID, senderID } = event;
  
  if (args.length < 3) {
    return api.sendMessage(
      `📋 Invitation Command\n\n` +
      `Usage: ${config.PREFIX}invite [uid] [text] [group_cid]\n\n` +
      `Example:\n` +
      `${config.PREFIX}invite 123456789 "Join our community" 987654321\n\n` +
      `Note: All friend requests are auto-accepted`,
      threadID, messageID
    );
  }

  const userId = args[0];
  const groupId = args[args.length - 1];
  const inviteText = args.slice(1, -1).join(" ");

  try {
    // Construct invitation message with bot ID
    const inviteMsg = `📬 Group Invitation\n\n` +
                     `${inviteText}\n\n` +
                     `Requirements:\n` +
                     `1. Add bot as friend (ID: ${api.getCurrentUserID()})\n` +
                     `2. React/reply to accept\n\n` +
                     `Note: All friend requests are auto-accepted`;
    
    // Send invitation
    const sentMsg = await api.sendMessage(inviteMsg, userId);
    
    // Store invitation data
    pendingInvites.set(sentMsg.messageID, {
      groupId: groupId,
      inviterId: senderID,
      timestamp: Date.now()
    });

    // Set 24-hour expiration
    setTimeout(() => {
      pendingInvites.delete(sentMsg.messageID);
    }, 86400000);

    await api.sendMessage(
      `📩 Invitation sent to ${userId}\n\n` +
      `They need to:\n` +
      `1. Add bot (if not friends)\n` +
      `2. React/reply to accept\n\n` +
      `Friend requests will be auto-accepted`,
      threadID, messageID
    );

  } catch (error) {
    await api.sendMessage(
      `❌ Failed to invite ${userId}:\n${error.message}\n\n` +
      `Possible solutions:\n` +
      `1. User must allow message requests\n` +
      `2. User may need to add bot first\n` +
      `3. Check if user ID is correct`,
      threadID, messageID
    );
  }
};
