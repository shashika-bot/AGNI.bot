const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");
const { cmd } = require("../command");

cmd({
    pattern: "song",
    desc: "Download song from YouTube",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🎵 *Please type a song name!* \n\n💡 Example: _.song despacito_");

        reply("🔎 *Searching your song... Please wait!*");

        // YouTube Search
        let search = await yts(q);
        let video = search.videos[0];
        if (!video) return reply("❌ Sorry, I couldn't find that song!");

        // Nice info message
        let caption = `
🎶 *Your Song is Ready!* 🎶
──────────────────
✨ Title: *${video.title}*
📺 Channel: *${video.author.name}*
⏱️ Duration: *${video.timestamp}*
👀 Views: *${video.views.toLocaleString()}*
🔗 Link: ${video.url}
──────────────────
⬇️ *Downloading MP3... Please wait!* ⏳
        `;

        await conn.sendMessage(from, { image: { url: video.thumbnail }, caption }, { quoted: mek });

        // Temp file
        let filePath = path.join(__dirname, "../temp", `${Date.now()}.mp3`);

        // Download audio
        const stream = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" })
            .pipe(fs.createWriteStream(filePath));

        stream.on("finish", async () => {
            await conn.sendMessage(from, {
                audio: fs.readFileSync(filePath),
                mimetype: "audio/mpeg",
                fileName: `${video.title}.mp3`,
            }, { quoted: mek });

            fs.unlinkSync(filePath); // delete temp file
        });

    } catch (e) {
        console.log(e);
        reply("⚠️ Error: " + e.message);
    }
});
