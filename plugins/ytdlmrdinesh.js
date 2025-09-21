const config = require('../config');
const { cmd } = require('../command');
const { ytsearch, ytmp3, ytmp4 } = require('@dark-yasiya/yt-dl.js'); 

// video

cmd({ 
    pattern: "mp4", 
    alias: ["video", "ytv"], 
    react: "🎥", 
    desc: "Download Youtube song", 
    category: "main", 
    use: '.song < Yt url or Name >', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply }) => { 
    try { 
        if (!q) return await reply("*𝐏ℓєαʂє 𝐏ɼ๏νιɖє 𝐀 𝐘ʈ 𝐔ɼℓ ๏ɼ 𝐕ιɖє๏ 𝐍αмє..*");
        
        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("No results found!");
        
        let yts = yt.results[0];  
        let apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(yts.url)}&format=mp4&apikey=sadiya123`;
        
        let response = await fetch(apiUrl);
        let data = await response.json();
        
        if (!data.success || !data.download_url) {
            return reply("Failed to fetch the video. Please try again later.");
        }
        
        let ytmsg = `╔═══〔 *QUEEN-SADU𓆪* 〕═══❒
║╭───────────────◆  
║│ *❍ ᴠɪᴅᴇᴏ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*
║╰───────────────◆
╚══════════════════❒
╔══════════════════❒
║ ⿻ *ᴛɪᴛʟᴇ:*  ${yts.title}
║ ⿻ *ᴅᴜʀᴀᴛɪᴏɴ:*  ${yts.timestamp}
║ ⿻ *ᴠɪᴇᴡs:*  ${yts.views}
║ ⿻ *ᴀᴜᴛʜᴏʀ:*  ${yts.author.name}
║ ⿻ *ʟɪɴᴋ:*  ${yts.url}
╚══════════════════❒
*ᴩᴏᴡᴇʀᴇᴅ ʙʏ ©ᴍʀ ᴅɪɴᴇꜱʜ ᴏꜰᴄ*`;

        // Send video details
        await conn.sendMessage(from, { image: { url: data.thumbnail || yts.thumbnail }, caption: ytmsg }, { quoted: mek });
        
        // Send video file
        await conn.sendMessage(from, { video: { url: data.download_url }, mimetype: "video/mp4" }, { quoted: mek });
        
        // Send document file (optional)
        await conn.sendMessage(from, { 
            document: { url: data.download_url }, 
            mimetype: "video/mp4", 
            fileName: `${data.title || yts.title}.mp4`, 
            caption: `*${yts.title}*\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ🎐*`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});  
       
// play

cmd({ 
     pattern: "song", 
     alias: ["yta", "play"], 
     react: "🎶", 
     desc: "Download Youtube song",
     category: "main", 
     use: '.song < Yt url or Name >', 
     filename: __filename }, 
     async (conn, mek, m, { from, prefix, quoted, q, reply }) => 
     
     { try { if (!q) return await reply("*𝐏ℓєαʂє 𝐏ɼ๏νιɖє 𝐀 𝐘ʈ 𝐔ɼℓ ๏ɼ 𝐒๏ƞ͛g 𝐍αмє..*");

const yt = await ytsearch(q);
    if (yt.results.length < 1) return reply("No results found!");
    
    let yts = yt.results[0];  
    let apiUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(yts.url)}&format=mp3&apikey=sadiya123`;
    
    let response = await fetch(apiUrl);
    let data = await response.json();
    
    if (!data.success || !data.download_url) {
        return reply("*සමාවන්න ඔබ ඉල්ලු දෙය ලබා දිය නොහැක. api down වීමක් හේතුවෙන් dwonlod අසාර්ථක වේ. Zepix වෙතින් ඉක්මනින් යාවත්කාලින වේ.*");
    }
    
    let ytmsg = `╔═══〔 *𓆩QUEEN-SADU𓆪* 〕═══❒
║╭───────────────◆  
║│ *QUEEN-SADU-𝐌Ɗ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐈𝐍𝐆*
║╰───────────────◆
╚══════════════════❒
╔══════════════════❒
║ ⿻ *ᴛɪᴛʟᴇ:*  ${yts.title}
║ ⿻ *ᴅᴜʀᴀᴛɪᴏɴ:*  ${yts.timestamp}
║ ⿻ *ᴠɪᴇᴡs:*  ${yts.views}
║ ⿻ *ᴀᴜᴛʜᴏʀ:*  ${yts.author.name}
║ ⿻ *ʟɪɴᴋ:*  ${yts.url}
╚══════════════════❒
*ᴩᴏᴡᴇʀᴇᴅ ʙʏ © ᴍʀ ᴅɪɴᴇꜱʜ*`;

// Send song details
    await conn.sendMessage(from, { image: { url: data.thumbnail || yts.thumbnail }, caption: ytmsg }, { quoted: mek });
    
    // Send audio file
    await conn.sendMessage(from, { audio: { url: data.download_url }, mimetype: "audio/mpeg" }, { quoted: mek });
    
    // Send document file
    await conn.sendMessage(from, { 
        document: { url: data.download_url }, 
        mimetype: "audio/mpeg", 
        fileName: `${data.title || yts.title}.mp3`, 
        caption: `> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ🎐*`
    }, { quoted: mek });

} catch (e) {
    console.log(e);
    reply("සමාවන්න ඔබ ඉල්ලු දෙය ලබා දිය නොහැක. api down වීමක් හේතුවෙන් dwonlod අසාර්ථක වේ. Zepix වෙතින් ඉක්මනින් යාවත්කාලින වේ.*");
}

});
