const lyricsFinder = require("lyrics-finder");
const { cmd } = require("../command");

cmd({
    pattern: "lyrics",
    desc: "Get lyrics of a song",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Example: *.lyrics despacito*");

        let lyrics = await lyricsFinder("", q);  // search by song name
        if (!lyrics) lyrics = "❌ Sorry, lyrics not found!";

        await conn.sendMessage(from, {
            text: `📜 *Lyrics for:* ${q}\n\n${lyrics}`
        }, { quoted: mek });

    } catch (e) {
        reply("⚠️ " + e.message);
    }
});
