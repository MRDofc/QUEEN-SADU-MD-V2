hereconst config = require('../config');
const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js'); 
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');

// video downloader
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
        
        await reply("🔍 *Searching...*");
        
        let videoUrl;
        if (ytdl.validateURL(q)) {
            videoUrl = q;
        } else {
            const yt = await ytsearch(q);
            if (yt.results.length < 1) return reply("❌ No results found!");
            videoUrl = yt.results[0].url;
        }
        
        // Get video info
        const info = await ytdl.getInfo(videoUrl);
        const videoDetails = info.videoDetails;
        
        // Filter video formats (get best quality mp4)
        const videoFormat = ytdl.chooseFormat(info.formats, { 
            quality: 'highest',
            filter: format => format.container === 'mp4' && format.hasVideo && format.hasAudio
        });
        
        if (!videoFormat) {
            return reply("❌ No suitable video format found!");
        }
        
        let ytmsg = `╔═══〔 *QUEEN-SADU𓆪* 〕═══❒
║╭───────────────◆  
║│ *❍ ᴠɪᴅᴇᴏ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*
║╰───────────────◆
╚══════════════════❒
╔══════════════════❒
║ ⿻ *ᴛɪᴛʟᴇ:* ${videoDetails.title}
║ ⿻ *ᴅᴜʀᴀᴛɪᴏɴ:* ${Math.floor(videoDetails.lengthSeconds / 60)}:${videoDetails.lengthSeconds % 60}
║ ⿻ *ᴠɪᴇᴡs:* ${parseInt(videoDetails.viewCount).toLocaleString()}
║ ⿻ *ᴀᴜᴛʜᴏʀ:* ${videoDetails.author.name}
║ ⿻ *ᴜʀʟ:* ${videoDetails.video_url}
║ ⿻ *ǫᴜᴀʟɪᴛʏ:* ${videoFormat.qualityLabel || 'Unknown'}
╚══════════════════❒
*ᴩᴏᴡᴇʀᴇᴅ ʙʏ ©ᴍʀ ᴅɪɴᴇꜱʜ ᴏꜰᴄ*`;

        // Send video details with thumbnail
        await conn.sendMessage(from, { 
            image: { url: videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url }, 
            caption: ytmsg 
        }, { quoted: mek });
        
        await reply("⬇️ *Downloading video...*");
        
        // Create temp file
        const tempDir = './temp';
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        
        const fileName = `${videoDetails.videoId}.mp4`;
        const filePath = path.join(tempDir, fileName);
        
        // Download video
        const videoStream = ytdl(videoUrl, { format: videoFormat });
        const writeStream = fs.createWriteStream(filePath);
        
        await new Promise((resolve, reject) => {
            videoStream.pipe(writeStream);
            videoStream.on('end', resolve);
            videoStream.on('error', reject);
        });
        
        const stats = fs.statSync(filePath);
        const fileSizeInMB = stats.size / (1024 * 1024);
        
        if (fileSizeInMB > 100) {
            fs.unlinkSync(filePath);
            return reply("❌ File too large! Maximum size is 100MB.");
        }
        
        await reply("📤 *Uploading video...*");
        
        // Send video file
        await conn.sendMessage(from, { 
            video: fs.readFileSync(filePath),
            mimetype: "video/mp4",
            caption: `*${videoDetails.title}*\n\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ🎐*`
        }, { quoted: mek });
        
        // Send as document too
        await conn.sendMessage(from, { 
            document: fs.readFileSync(filePath),
            mimetype: "video/mp4", 
            fileName: `${videoDetails.title}.mp4`,
            caption: `*${videoDetails.title}*\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ🎐*`
        }, { quoted: mek });
        
        // Clean up temp file
        fs.unlinkSync(filePath);

    } catch (e) {
        console.log(e);
        reply(`❌ An error occurred: ${e.message}`);
    }
});  
       
// audio downloader (song)
cmd({ 
    pattern: "song", 
    alias: ["yta", "play", "audio"], 
    react: "🎶", 
    desc: "Download Youtube audio",
    category: "main", 
    use: '.song < Yt url or Name >', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply }) => { 
    try { 
        if (!q) return await reply("*𝐏ℓєαʂє 𝐏ɼ๏νιɖє 𝐀 𝐘ʈ 𝐔ɼℓ ๏ɼ 𝐒๏ƞ͛g 𝐍αмє..*");
        
        await reply("🔍 *Searching...*");
        
        let videoUrl;
        if (ytdl.validateURL(q)) {
            videoUrl = q;
        } else {
            const yt = await ytsearch(q);
            if (yt.results.length < 1) return reply("❌ No results found!");
            videoUrl = yt.results[0].url;
        }
        
        // Get video info
        const info = await ytdl.getInfo(videoUrl);
        const videoDetails = info.videoDetails;
        
        // Filter audio formats (get best quality audio)
        const audioFormat = ytdl.chooseFormat(info.formats, { 
            quality: 'highestaudio',
            filter: 'audioonly'
        });
        
        if (!audioFormat) {
            return reply("❌ No suitable audio format found!");
        }
        
        let ytmsg = `╔═══〔 *𓆩QUEEN-SADU𓆪* 〕═══❒
║╭───────────────◆  
║│ *QUEEN-SADU-𝐌Ɗ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐈𝐍𝐆*
║╰───────────────◆
╚══════════════════❒
╔══════════════════❒
║ ⿻ *ᴛɪᴛʟᴇ:* ${videoDetails.title}
║ ⿻ *ᴅᴜʀᴀᴛɪᴏɴ:* ${Math.floor(videoDetails.lengthSeconds / 60)}:${(videoDetails.lengthSeconds % 60).toString().padStart(2, '0')}
║ ⿻ *ᴠɪᴇᴡs:* ${parseInt(videoDetails.viewCount).toLocaleString()}
║ ⿻ *ᴀᴜᴛʜᴏʀ:* ${videoDetails.author.name}
║ ⿻ *ᴜʀʟ:* ${videoDetails.video_url}
║ ⿻ *ǫᴜᴀʟɪᴛʏ:* ${audioFormat.audioBitrate ? audioFormat.audioBitrate + 'kbps' : 'High Quality'}
╚══════════════════❒
*ᴩᴏᴡᴇʀᴇᴅ ʙʏ © ᴍʀ ᴅɪɴᴇꜱʜ*`;

        // Send song details with thumbnail
        await conn.sendMessage(from, { 
            image: { url: videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url }, 
            caption: ytmsg 
        }, { quoted: mek });
        
        await reply("⬇️ *Downloading audio...*");
        
        // Create temp file
        const tempDir = './temp';
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        
        const fileName = `${videoDetails.videoId}.mp3`;
        const filePath = path.join(tempDir, fileName);
        
        // Download audio
        const audioStream = ytdl(videoUrl, { format: audioFormat });
        const writeStream = fs.createWriteStream(filePath);
        
        await new Promise((resolve, reject) => {
            audioStream.pipe(writeStream);
            audioStream.on('end', resolve);
            audioStream.on('error', reject);
        });
        
        const stats = fs.statSync(filePath);
        const fileSizeInMB = stats.size / (1024 * 1024);
        
        if (fileSizeInMB > 50) {
            fs.unlinkSync(filePath);
            return reply("❌ File too large! Maximum size is 50MB.");
        }
        
        await reply("📤 *Uploading audio...*");
        
        // Send audio file
        await conn.sendMessage(from, { 
            audio: fs.readFileSync(filePath),
            mimetype: "audio/mpeg",
            fileName: `${videoDetails.title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: videoDetails.title,
                    body: videoDetails.author.name,
                    thumbnailUrl: videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url,
                    sourceUrl: videoDetails.video_url,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });
        
        // Send as document too
        await conn.sendMessage(from, { 
            document: fs.readFileSync(filePath),
            mimetype: "audio/mpeg", 
            fileName: `${videoDetails.title}.mp3`,
            caption: `*${videoDetails.title}*\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ🎐*`
        }, { quoted: mek });
        
        // Clean up temp file
        fs.unlinkSync(filePath);

    } catch (e) {
        console.log(e);
        reply(`❌ An error occurred: ${e.message}`);
    }
});
