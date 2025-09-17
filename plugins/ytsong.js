const { cmd, commands } = require("../command");
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

cmd(
  {
    pattern: "song",
    react: "🎵",
    desc: "Download Song",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, quoted, q, reply }) => {
    try {
      if (!q) return reply("*නමක් හරි ලින්ක් එකක් හරි දෙන්න* 🌚❤️");

      // Search for the video
      const search = await yts(q);
      if (!search.videos.length)
        return reply("❌ Video not found, try another query.");

      const data = search.videos[0];
      const url = data.url;

      // Song metadata description
      let desc = `
*agni SONG DOWNLOADER❤️*

👻 *title* : ${data.title}
👻 *description* : ${data.description}
👻 *time* : ${data.timestamp}
👻 *ago* : ${data.ago}
👻 *views* : ${data.views}
👻 *url* : ${data.url}

𝐌𝐚𝐝𝐞 𝐛𝐲 Shashika
`;

      // Send metadata thumbnail message
      await robin.sendMessage(
        from,
        { image: { url: data.thumbnail }, caption: desc },
        { quoted: mek }
      );

      // Validate song duration (limit: 30 minutes)
      let durationParts = data.timestamp.split(":").map(Number);
      let totalSeconds =
        durationParts.length === 3
          ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
          : durationParts[0] * 60 + durationParts[1];

      if (totalSeconds > 1800) {
        return reply("⏱️ Audio limit is 30 minutes");
      }

      // Download audio using ytdl-core
      const tempFile = path.join(__dirname, `${data.title}.mp3`);
      const stream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });

      stream.pipe(fs.createWriteStream(tempFile));

      stream.on("end", async () => {
        // Send audio file
        await robin.sendMessage(
          from,
          { audio: fs.createReadStream(tempFile), mimetype: "audio/mpeg" },
          { quoted: mek }
        );

        // Optional: send as document
        await robin.sendMessage(
          from,
          {
            document: fs.createReadStream(tempFile),
            mimetype: "audio/mpeg",
            fileName: `${data.title}.mp3`,
            caption: "𝐌𝐚𝐝𝐞 𝐛𝐲 Shashika",
          },
          { quoted: mek }
        );

        // Delete temp file
        fs.unlinkSync(tempFile);
      });

      stream.on("error", (err) => {
        console.log(err);
        reply("❌ Failed to download audio!");
      });
    } catch (e) {
      console.log(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);
