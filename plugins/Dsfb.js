const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Facebook Video Downloader
cmd({
    pattern: "fb",
    alias: ["facebook", "fbdl"],
    react: "📱",
    desc: "Download Facebook videos",
    category: "main",
    use: '.fb <facebook video url>',
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply }) => {
    try {
        if (!q) return await reply("*Please provide a Facebook video URL!*");
        
        // Validate Facebook URL
        if (!q.includes('facebook.com') && !q.includes('fb.watch')) {
            return await reply("❌ *Please provide a valid Facebook video URL!*");
        }
        
        await reply("🔍 *Processing Facebook video...*");
        
        // Multiple API endpoints for reliability
        const apiEndpoints = [
            `https://api.fabdl.com/facebook/video-info?url=${encodeURIComponent(q)}`,
            `https://www.saveday.app/api/facebook-video-downloader?url=${encodeURIComponent(q)}`,
            `https://api-ssl.bitly.com/v4/expand?long_url=${encodeURIComponent(q)}`
        ];
        
        let videoData = null;
        let currentApi = 0;
        
        // Try different APIs
        while (!videoData && currentApi < apiEndpoints.length) {
            try {
                const response = await axios.get(apiEndpoints[currentApi], {
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                
                if (response.data && response.data.success) {
                    videoData = response.data;
                    break;
                }
            } catch (error) {
                console.log(`API ${currentApi + 1} failed:`, error.message);
                currentApi++;
            }
        }
        
        // If APIs fail, try direct scraping method
        if (!videoData) {
            try {
                videoData = await scrapeFacebookVideo(q);
            } catch (error) {
                console.log("Direct scraping failed:", error.message);
            }
        }
        
        if (!videoData || !videoData.video_url) {
            return await reply("❌ *Unable to process this Facebook video. Please check the URL or try again later.*");
        }
        
        const videoInfo = `╔═══〔 *FACEBOOK DOWNLOADER* 〕═══❒
║╭───────────────◆  
║│ *❍ ꜰᴀᴄᴇʙᴏᴏᴋ ᴠɪᴅᴇᴏ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*
║╰───────────────◆
╚══════════════════❒
╔══════════════════❒
║ ⿻ *ᴛɪᴛʟᴇ:* ${videoData.title || 'Facebook Video'}
║ ⿻ *ᴅᴜʀᴀᴛɪᴏɴ:* ${videoData.duration || 'Unknown'}
║ ⿻ *Qᴜᴀʟɪᴛʏ:* ${videoData.quality || 'HD'}
║ ⿻ *ꜱɪᴢᴇ:* ${videoData.size || 'Unknown'}
╚══════════════════❒
*ᴩᴏᴡᴇʀᴇᴅ ʙʏ ©ᴍʀ ᴅɪɴᴇꜱʜ ᴏꜰᴄ*`;

        // Send video info with thumbnail
        await conn.sendMessage(from, {
            image: { url: videoData.thumbnail || 'https://i.ibb.co/0qx2JqJ/fb-logo.png' },
            caption: videoInfo
        }, { quoted: mek });
        
        await reply("⬇️ *Downloading Facebook video...*");
        
        // Download and send video
        const videoResponse = await axios.get(videoData.video_url, {
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const videoBuffer = Buffer.from(videoResponse.data);
        const videoSizeInMB = videoBuffer.length / (1024 * 1024);
        
        if (videoSizeInMB > 100) {
            return await reply("❌ *Video file is too large! Maximum size is 100MB.*");
        }
        
        await reply("📤 *Uploading Facebook video...*");
        
        // Send video
        await conn.sendMessage(from, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: `*${videoData.title || 'Facebook Video'}*\n\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ🎐*`
        }, { quoted: mek });
        
        // Send as document
        await conn.sendMessage(from, {
            document: videoBuffer,
            mimetype: 'video/mp4',
            fileName: `${videoData.title || 'facebook_video'}.mp4`,
            caption: `> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ🎐*`
        }, { quoted: mek });
        
    } catch (error) {
        console.log('FB Download Error:', error);
        await reply(`❌ *Error downloading Facebook video: ${error.message}*`);
    }
});

// Alternative direct scraping method
async function scrapeFacebookVideo(url) {
    try {
        // This is a simplified scraping approach
        // You might need to implement more sophisticated scraping
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const html = response.data;
        
        // Extract video URL from HTML (basic regex approach)
        const videoRegex = /"playable_url":"([^"]+)"/g;
        const match = videoRegex.exec(html);
        
        if (match && match[1]) {
            const videoUrl = match[1].replace(/\\u0025/g, '%').replace(/\\/g, '');
            
            return {
                video_url: decodeURIComponent(videoUrl),
                title: 'Facebook Video',
                success: true
            };
        }
        
        throw new Error('Could not extract video URL');
        
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

// Instagram downloader as bonus
cmd({
    pattern: "ig",
    alias: ["instagram", "igdl"],
    react: "📷",
    desc: "Download Instagram videos/photos",
    category: "main",
    use: '.ig <instagram url>',
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply }) => {
    try {
        if (!q) return await reply("*Please provide an Instagram URL!*");
        
        if (!q.includes('instagram.com')) {
            return await reply("❌ *Please provide a valid Instagram URL!*");
        }
        
        await reply("🔍 *Processing Instagram content...*");
        
        // Try Instagram downloader API
        const apiUrl = `https://api.saveday.app/api/instagram-downloader?url=${encodeURIComponent(q)}`;
        
        const response = await axios.get(apiUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.data || !response.data.success) {
            return await reply("❌ *Unable to process this Instagram content. Please try again later.*");
        }
        
        const mediaData = response.data;
        
        const mediaInfo = `╔═══〔 *INSTAGRAM DOWNLOADER* 〕═══❒
║╭───────────────◆  
║│ *❍ ɪɴꜱᴛᴀɢʀᴀᴍ ᴍᴇᴅɪᴀ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*
║╰───────────────◆
╚══════════════════❒
╔══════════════════❒
║ ⿻ *ᴛʏᴘᴇ:* ${mediaData.type || 'Media'}
║ ⿻ *ᴄᴀᴘᴛɪᴏɴ:* ${mediaData.caption ? mediaData.caption.substring(0, 50) + '...' : 'No caption'}
║ ⿻ *ᴀᴜᴛʜᴏʀ:* ${mediaData.username || 'Unknown'}
╚══════════════════❒
*ᴩᴏᴡᴇʀᴇᴅ ʙʏ ©ᴍʀ ᴅɪɴᴇꜱʜ ᴏꜰᴄ*`;

        await conn.sendMessage(from, {
            image: { url: mediaData.thumbnail || 'https://i.ibb.co/7QZ9y8C/ig-logo.png' },
            caption: mediaInfo
        }, { quoted: mek });
        
        await reply("⬇️ *Downloading Instagram content...*");
        
        // Download media
        if (mediaData.video_url) {
            // Video
            const videoResponse = await axios.get(mediaData.video_url, {
                responseType: 'arraybuffer',
                timeout: 30000
            });
            
            await conn.sendMessage(from, {
                video: Buffer.from(videoResponse.data),
                mimetype: 'video/mp4',
                caption: `> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ🎐*`
            }, { quoted: mek });
            
        } else if (mediaData.image_url) {
            // Image
            const imageResponse = await axios.get(mediaData.image_url, {
                responseType: 'arraybuffer',
                timeout: 30000
            });
            
            await conn.sendMessage(from, {
                image: Buffer.from(imageResponse.data),
                caption: `> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ🎐*`
            }, { quoted: mek });
        }
        
    } catch (error) {
        console.log('IG Download Error:', error);
        await reply(`❌ *Error downloading Instagram content: ${error.message}*`);
    }
});
