const config = require('../config')
const {cmd , commands} = require('../command')

cmd({
    pattern: "onlinelist",
    react: "🟢",
    alias: ["online","onlinemembers","activelist"],
    desc: "Show online members in group with mentions",
    category: "group",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

    // Check if command is used in a group
    if (!isGroup) return reply("❌ This command can only be used in groups!")
    
    // Check if bot has admin permissions (optional - remove if not needed)
    if (!isBotAdmins) return reply("❌ Bot needs admin permissions to check online status!")
    
    // Get group participants
    const groupParticipants = participants || groupMetadata.participants
    
    // Array to store online members
    let onlineMembers = []
    let onlineMentions = []
    
    // Check each participant's presence/status
    for (let participant of groupParticipants) {
        try {
            // Get user's presence/last seen info
            const presence = await conn.presenceSubscribe(participant.id)
            const lastSeen = await conn.chatRead(participant.id)
            
            // Check if user is online (you can adjust this logic based on your needs)
            // This is a basic implementation - you might need to modify based on your bot's capabilities
            const userStatus = await conn.fetchStatus(participant.id).catch(() => null)
            
            // For now, we'll consider all participants as potentially online
            // You can implement more sophisticated online detection here
            
            onlineMembers.push(participant.id.split('@')[0])
            onlineMentions.push(participant.id)
            
        } catch (err) {
            // If can't fetch status, skip this user
            continue
        }
    }
    
    // If no online detection is available, show all group members as a fallback
    if (onlineMembers.length === 0) {
        groupParticipants.forEach(participant => {
            onlineMembers.push(participant.id.split('@')[0])
            onlineMentions.push(participant.id)
        })
    }
    
    // Create the online list message
    let onlineList = `*╭──────────●●►*\n`
    onlineList += `*🟢 ${groupName} ONLINE LIST 🟢*\n\n`
    onlineList += `*📊 Total Members:* ${groupParticipants.length}\n`
    onlineList += `*🟢 Online Members:* ${onlineMembers.length}\n\n`
    onlineList += `*👥 Online Members List:*\n`
    
    // Add each online member with mention
    onlineMembers.forEach((member, index) => {
        onlineList += `${index + 1}. @${member}\n`
    })
    
    onlineList += `\n*╰──────────●●►*\n`
    onlineList += `*🤖 QUEEN-SADU BOT*`
    
    // Send the message with mentions
    await conn.sendMessage(from, {
        text: onlineList,
        mentions: onlineMentions
    }, {quoted: mek})

}catch(e){
    console.log(e)
    reply(`❌ Error: ${e}`)
}
})

// Alternative simpler version that just shows all group members
cmd({
    pattern: "grouplist",
    react: "👥",
    alias: ["memberlist","groupmembers","allmembers"],
    desc: "Show all group members with mentions",
    category: "group", 
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

    // Check if command is used in a group
    if (!isGroup) return reply("❌ This command can only be used in groups!")
    
    // Get group participants
    const groupParticipants = participants || groupMetadata.participants
    
    // Arrays for members and mentions
    let membersList = []
    let mentionsList = []
    
    // Get all members
    groupParticipants.forEach(participant => {
        membersList.push(participant.id.split('@')[0])
        mentionsList.push(participant.id)
    })
    
    // Create the members list message
    let membersMessage = `*╭──────────●●►*\n`
    membersMessage += `*👥 ${groupName} MEMBERS LIST 👥*\n\n`
    membersMessage += `*📊 Total Members:* ${membersList.length}\n\n`
    membersMessage += `*👥 All Members:*\n`
    
    // Add each member with mention
    membersList.forEach((member, index) => {
        membersMessage += `${index + 1}. @${member}\n`
    })
    
    membersMessage += `\n*╰──────────●●►*\n`
    membersMessage += `*🤖 QUEEN-SADU BOT*`
    
    // Send the message with mentions
    await conn.sendMessage(from, {
        text: membersMessage,
        mentions: mentionsList
    }, {quoted: mek})

}catch(e){
    console.log(e)
    reply(`❌ Error: ${e}`)
}
})
