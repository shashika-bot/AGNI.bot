const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");
const { cmd } = require("../command");

cmd({
    pattern: "song",
    desc: "Download song with options",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🎵 *Please type a song name!* \n\n💡 Example: _.song despacito_");

        reply("🔎 *Searching your song... Please wait!*");

        let search = await yts(q);
        let video = search.videos[0];
        if (!video) return reply("❌ Sorry, I couldn't find that song!");

        let caption = `
🎶 *Choose Download Option* 🎶
──────────────────
✨ Title: *${video.title}*
📺 Channel: *${video.author.name}*
⏱️ Duration: *${video.timestamp}*
👀 Views: *${video.views.toLocaleString()}*
──────────────────
1️⃣ Send: *.songaudio ${q}* → 🎧 Audio file  
2️⃣ Send: *.songdoc ${q}* → 📂 Document file  
3️⃣ Send: *.lyrics ${q}* → 📜 Lyrics  
        `;

        await conn.sendMessage(from, { image: { url: video.thumbnail }, caption }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("⚠️ Error: " + e.message);
    }
});


// ─────────────── 🎧 Audio as Audio
cmd({
    pattern: "songaudio",
    desc: "Download song as audio",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Example: *.songaudio despacito*");

        let search = await yts(q);
        let video = search.videos[0];
        if (!video) return reply("Song not found!");

        let filePath = path.join(__dirname, "../temp", `${Date.now()}.mp3`);
        const stream = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" })
            .pipe(fs.createWriteStream(filePath));

        stream.on("finish", async () => {
            await conn.sendMessage(from, {
                audio: fs.readFileSync(filePath),
                mimetype: "audio/mpeg",
                fileName: `${video.title}.mp3`,
            }, { quoted: mek });
            fs.unlinkSync(filePath);
        });

    } catch (e) {
        reply("⚠️ " + e.message);
    }
});


// ─────────────── 📂 Audio as Document
cmd({
    pattern: "songdoc",
    desc: "Download song as document",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Example: *.songdoc despacito*");

        let search = await yts(q);
        let video = search.videos[0];
        if (!video) return reply("Song not found!");

        let filePath = path.join(__dirname, "../temp", `${Date.now()}.mp3`);
        const stream = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" })
            .pipe(fs.createWriteStream(filePath));

        stream.on("finish", async () => {
            await conn.sendMessage(from, {
                document: fs.readFileSync(filePath),
                mimetype: "audio/mpeg",
                fileName: `${video.title}.mp3`,
            }, { quoted: mek });
            fs.unlinkSync(filePath);
        });

    } catch (e) {
        reply("⚠️ " + e.message);
    }
});


// ─────────────── 📜 Lyrics
cmd({
    pattern: "lyrics",
    desc: "Get lyrics of a song",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Example: *.lyrics despacito*");

        let search = await yts(q);
        let video = search.videos[0];
        if (!video) return reply("Song not found!");

        // Lyrics API / fallback
        let lyrics = `📜 Lyrics for *${video.title}* are not integrated yet!`;

        await conn.sendMessage(from, { text: lyrics }, { quoted: mek });

    } catch (e) {
        reply("⚠️ " + e.message);
    }
});
