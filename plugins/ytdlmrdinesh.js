const config = require('../config');
const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js'); 

// Define constants for the new API
const API_BASE_URL = "https://ytdl.sandarux.sbs/api/download";
const API_KEY = "darknero";

// =================================================================
// 🎵 Command: MP4 / Video Download (.mp4, .video, .ytv)
// =================================================================

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
        
        // 1. Search YouTube
        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("No results found!");
        
        let yts = yt.results[0];  
        
        // 2. Construct New MP4 API URL
        const apiUrl = `${API_BASE_URL}?url=${encodeURIComponent(yts.url)}&format=mp4&quality=360&apikey=${API_KEY}`;
        
        // 3. Fetch data from the new API
        let response = await fetch(apiUrl);
        let data = await response.json();
        
        // --- Enhanced MP4 Validation and Extraction ---
        // We look for download_url first, then fallback to url, or simply assume data.result.url might hold it.
        const downloadUrl = data.result?.download_url || data.result?.url;

        if (!downloadUrl) {
             console.error("API Response Error (MP4 - Missing URL):", data);
             // Return the failure message if no URL is found
            return reply("Failed to fetch the video from the new API. Please try again later. (Check console for API response details)");
        }
        
        // --- Message Construction ---
        let ytmsg = `╔═══〔 *QUEEN-SADU𓆪* 〕═══❒
║╭───────────────◆  
║│ *❍ ᴠɪᴅᴇᴏ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*
║╰───────────────◆
╚══════════════════❒
╔══════════════════❒
║ ⿻ *ᴛɪᴛʟᴇ:* ${yts.title}
║ ⿻ *ᴅᴜʀᴀᴛɪᴏɴ:* ${yts.timestamp}
║ ⿻ *ᴠɪᴇᴡs:* ${yts.views}
║ ⿻ *ᴀᴜᴛʜᴏʀ:* ${yts.author.name}
║ ⿻ *ʟɪɴᴋ:* ${yts.url}
╚══════════════════❒
*ᴩᴏᴡᴇʀᴇᴅ ʙʏ ©ᴍʀ ᴅɪɴᴇꜱʜ ᴏꜰᴄ*`;

        // 5. Send results 
        
        // Send video details with thumbnail
        await conn.sendMessage(from, { 
            image: { url: data.result?.thumbnail || yts.thumbnail || '' }, 
            caption: ytmsg 
        }, { quoted: mek });
        
        // Send video file
        await conn.sendMessage(from, { 
            video: { url: downloadUrl }, 
            mimetype: "video/mp4",
            caption: `*${yts.title}*\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ🎐*` 
        }, { quoted: mek });
        
        // Send document file (optional)
        await conn.sendMessage(from, { 
            document: { url: downloadUrl }, 
            mimetype: "video/mp4", 
            fileName: `${yts.title}.mp4`, 
            caption: `*${yts.title}*\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ🎐*`
        }, { quoted: mek });

    } catch (e) {
        console.error("MP4 Error:", e);
        reply("An error occurred during video download. Please try again later.");
    }
});  
       
// =================================================================
// 🎶 Command: MP3 / Audio Download (.song, .yta, .play)
// =================================================================

cmd({ 
     pattern: "song", 
     alias: ["yta", "play"], 
     react: "🎶", 
     desc: "Download Youtube song",
     category: "main", 
     use: '.song < Yt url or Name >', 
     filename: __filename }, 
     async (conn, mek, m, { from, prefix, quoted, q, reply }) => 
     
     { try { 
        if (!q) return await reply("*𝐏ℓєαʂє 𝐏ɼ๏νιɖє 𝐀 𝐘ʈ 𝐔ɼℓ ๏ɼ 𝐒๏ƞ͛g 𝐍αмє..*");

        // 1. Search YouTube
        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("No results found!");
        
        let yts = yt.results[0];  
        
        // 2. Construct New MP3 API URL
        const apiUrl = `${API_BASE_URL}?url=${encodeURIComponent(yts.url)}&format=mp3&apikey=${API_KEY}`;
        
        // 3. Fetch data from the new API
        let response = await fetch(apiUrl);
        let data = await response.json();
        
        // --- Enhanced MP3 Validation and Extraction ---
        // We look for downloadUrl first, then fallback to url, or simply check the result object
        const downloadUrl = data.result?.downloadUrl || data.result?.url;

        if (!downloadUrl) {
            console.error("API Response Error (MP3 - Missing URL):", data);
            return reply("Failed to fetch the audio from the new API. Please try again later. (Check console for API response details)");
        }
        
        // --- Message Construction ---
        let ytmsg = `╔═══〔 *𓆩QUEEN-SADU𓆪* 〕═══❒
║╭───────────────◆  
║│ *QUEEN-SADU-𝐌Ɗ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐈𝐍𝐆*
║╰───────────────◆
╚══════════════════❒
╔══════════════════❒
║ ⿻ *ᴛɪᴛʟᴇ:* ${yts.title}
║ ⿻ *ᴅᴜʀᴀᴛɪᴏɴ:* ${yts.timestamp}
║ ⿻ *ᴠɪᴇᴡs:* ${yts.views}
║ ⿻ *ᴀᴜᴛʜᴏʀ:* ${yts.author.name}
║ ⿻ *ʟɪɴᴋ:* ${yts.url}
╚══════════════════❒
*ᴩᴏᴡᴇʀᴇᴅ ʙʏ © ᴍʀ ᴅɪɴᴇꜱʜ*`;

        // 5. Send results 

        // Send song details with thumbnail
        await conn.sendMessage(from, { 
            image: { url: data.result?.image || yts.thumbnail || '' }, 
            caption: ytmsg 
        }, { quoted: mek });
        
        // Send audio file
        await conn.sendMessage(from, { 
            audio: { url: downloadUrl }, 
            mimetype: "audio/mpeg" 
        }, { quoted: mek });
        
        // Send document file
        await conn.sendMessage(from, { 
            document: { url: downloadUrl }, 
            mimetype: "audio/mpeg", 
            fileName: `${yts.title}.mp3`, 
            caption: `> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ🎐*`
        }, { quoted: mek });

    } catch (e) {
        console.error("MP3 Error:", e);
        reply("An error occurred during audio download. Please try again later.");
    }

});
