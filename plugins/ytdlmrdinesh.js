const config = require('../config');
const { cmd } = require('../command');
const { ytsearch, ytmp3, ytmp4 } = require('@dark-yasiya/yt-dl.js'); 

// video

cmd({ 
    pattern: "mp4", 
    alias: ["video", "ytv"], 
    react: "🎥", 
    desc: "Download Youtube video", 
    category: "main", 
    use: '.mp4 < Yt url or Name >', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply }) => { 
    try { 
        if (!q) return await reply("*𝐏ℓєαʂє 𝐏ɼ๏νιɖє 𝐀 𝐘ʈ 𝐔ɼℓ ๏ɼ 𝐕ιɖє๏ 𝐍αмє..*");
        
        // Search using Spotify API
        let searchUrl = `https://supun-md-api-xmjh.vercel.app/api/spotify-search?q=${encodeURIComponent(q)}`;
        let searchResponse = await fetch(searchUrl);
        let searchData = await searchResponse.json();
        
        if (!searchData.success || !searchData.data || searchData.data.length < 1) {
            return reply("No results found!");
        }
        
        let track = searchData.data[0];
        
        // Search on YouTube using the track info
        const yt = await ytsearch(`${track.name} ${track.artist}`);
        if (yt.results.length < 1) return reply("No YouTube results found!");
        
        let yts = yt.results[0];
        
        // Download video using ytmp4
        const video = await ytmp4(yts.url);
        if (!video.status || !video.dl_link) {
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
        await conn.sendMessage(from, { image: { url: video.thumb || yts.thumbnail }, caption: ytmsg }, { quoted: mek });
        
        // Send video file
        await conn.sendMessage(from, { video: { url: video.dl_link }, mimetype: "video/mp4" }, { quoted: mek });
        
        // Send document file (optional)
        await conn.sendMessage(from, { 
            document: { url: video.dl_link }, 
            mimetype: "video/mp4", 
            fileName: `${video.title || yts.title}.mp4`, 
            caption: `*${yts.title}*\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ🎐*`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});  
       
// play/song

cmd({ 
    pattern: "song", 
    alias: ["yta", "play"], 
    react: "🎶", 
    desc: "Download song from Spotify search",
    category: "main", 
    use: '.song < Song name >', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply }) => {
    try { 
        if (!q) return await reply("*𝐏ℓєαʂє 𝐏ɼ๏νιɖє 𝐀 𝐒๏ƞ͛g 𝐍αмє..*");

        // Search using Spotify API
        let searchUrl = `https://supun-md-api-xmjh.vercel.app/api/spotify-search?q=${encodeURIComponent(q)}`;
        let searchResponse = await fetch(searchUrl);
        let searchData = await searchResponse.json();
        
        if (!searchData.success || !searchData.data || searchData.data.length < 1) {
            return reply("No results found!");
        }
        
        let track = searchData.data[0];
        
        // Search on YouTube using the track info
        const yt = await ytsearch(`${track.name} ${track.artist}`);
        if (yt.results.length < 1) return reply("No YouTube results found!");
        
        let yts = yt.results[0];
        
        // Download audio using ytmp3
        const audio = await ytmp3(yts.url);
        if (!audio.status || !audio.dl_link) {
            return reply("*සමාවන්න ඔබ ඉල්ලු දෙය ලබා දිය නොහැක. api down වීමක් හේතුවෙන් dwonlod අසාර්ථක වේ. Zepix වෙතින් ඉක්මනින් යාවත්කාලින වේ.*");
        }
        
        let ytmsg = `╔═══〔 *𓆩QUEEN-SADU𓆪* 〕═══❒
║╭───────────────◆  
║│ *QUEEN-SADU-𝐌Ɗ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐈𝐍𝐆*
║╰───────────────◆
╚══════════════════❒
╔══════════════════❒
║ ⿻ *ᴛɪᴛʟᴇ:*  ${track.name}
║ ⿻ *ᴀʀᴛɪsᴛ:*  ${track.artist}
║ ⿻ *ᴅᴜʀᴀᴛɪᴏɴ:*  ${yts.timestamp}
║ ⿻ *ᴠɪᴇᴡs:*  ${yts.views}
║ ⿻ *ʏᴛ ʟɪɴᴋ:*  ${yts.url}
║ ⿻ *sᴘᴏᴛɪғʏ:*  ${track.external_urls?.spotify || 'N/A'}
╚══════════════════❒
*ᴩᴏᴡᴇʀᴇᴅ ʙʏ © ᴍʀ ᴅɪɴᴇꜱʜ*`;

        // Send song details with Spotify image
        await conn.sendMessage(from, { 
            image: { url: track.image || audio.thumb || yts.thumbnail }, 
            caption: ytmsg 
        }, { quoted: mek });
        
        // Send audio file
        await conn.sendMessage(from, { 
            audio: { url: audio.dl_link }, 
            mimetype: "audio/mpeg" 
        }, { quoted: mek });
        
        // Send document file
        await conn.sendMessage(from, { 
            document: { url: audio.dl_link }, 
            mimetype: "audio/mpeg", 
            fileName: `${track.name} - ${track.artist}.mp3`, 
            caption: `> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ🎐*`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("සමාවන්න ඔබ ඉල්ලු දෙය ලබා දිය නොහැක. api down වීමක් හේතුවෙන් dwonlod අසාර්ථක වේ. Zepix වෙතින් ඉක්මනින් යාවත්කාලින වේ.*");
    }
});
