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
        let apiData = await response.json(); // Renamed 'data' to 'apiData' to avoid conflict
        
        // --- FINAL MP4 DATA EXTRACTION ---
        // Look for data.data.download_url (or data.data.url) based on latest API structure analysis
        const extractedData = apiData.data || apiData.result || apiData;
        const downloadUrl = extractedData.download_url || extractedData.url; // Use download_url or url
        const thumbnail = extractedData.thumbnail || yts.thumbnail || '';

        if (!downloadUrl) {
             console.error("API Response Error (MP4 - Missing URL):", apiData);
            return reply("Failed to fetch the video from the API. Download URL not found in response.");
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
            image: { url: thumbnail }, 
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
        let apiData = await response.json(); // Renamed 'data' to 'apiData' to avoid conflict
        
        // --- FINAL MP3 DATA EXTRACTION ---
        // Look for data.data.downloadUrl based on latest API structure analysis
        const extractedData = apiData.data || apiData.result || apiData;
        const downloadUrl = extractedData.downloadUrl || extractedData.url; // Use downloadUrl or url
        const thumbnail = extractedData.thumbnail || extractedData.image || yts.thumbnail || '';


        if (!downloadUrl) {
            console.error("API Response Error (MP3 - Missing URL):", apiData);
            return reply("Failed to fetch the audio from the API. Download URL not found in response.");
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
            image: { url: thumbnail }, 
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
