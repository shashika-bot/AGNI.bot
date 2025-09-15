const { cmd } = require('../command');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

// temp folder auto-create
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

cmd({
  pattern: "ytmp3",
  category: "downloader",
  react: "🎵",
  desc: "Download YouTube audio as MP3",
  filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) {
      return reply("❌ Please provide a YouTube URL.\n\nExample: *.ytmp3 https://youtu.be/dQw4w9WgXcQ*");
    }

    // check video info
    const info = await ytdl.getInfo(q);
    const title = info.videoDetails.title;
    const views = info.videoDetails.viewCount;
    const author = info.videoDetails.author.name;
    const length = new Date(info.videoDetails.lengthSeconds * 1000).toISOString().substr(11, 8);
    const thumb = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;

    // file path
    const filePath = path.join(tempDir, `${Date.now()}.mp3`);

    // download audio
    const stream = ytdl(q, { filter: 'audioonly', quality: 'highestaudio' })
      .pipe(fs.createWriteStream(filePath));

    stream.on("finish", async () => {
      // caption like your style
      const caption = `
 /)  /)  ~ ┏━━━━━━━━━━━━━━━━━┓
( •-• )  ~ ♡ 𝐘𝐓 𝐒𝐎𝐍𝐆 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ♡
/づづ ~ ┗━━━━━━━━━━━━━━━━━┛    

╭━━━━━━━━━●●►
┢😊 𝐓𝐢𝐭𝐥𝐞: ${title}
┢😉 𝐀𝐮𝐭𝐡𝐨𝐫: ${author}
┢🥴 𝐓𝐢𝐦𝐞: ${length}
┢😑 𝐕𝐢𝐞𝐰𝐬: ${views}
╰━━━━━━━━●●►
   » [𒆜 ßÄÐkï††¥ 𒆜] «
  0:00 ─〇───── 0:47
b ⇄   ◃◃   ⅠⅠ   ▹▹   ↻
      `;

      // send thumb + caption
      await conn.sendMessage(from, {
        image: { url: thumb },
        caption: caption
      }, { quoted: mek });

      // send audio file
      await conn.sendMessage(from, {
        document: fs.readFileSync(filePath),
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        caption: "Shashika"
      }, { quoted: mek });

      // delete temp file
      fs.unlinkSync(filePath);

      // react success
      await conn.sendMessage(from, {
        react: { text: '✅', key: mek.key }
      });
    });

  } catch (e) {
    console.error(e);
    await reply(`⚠️ Error: ${e.message}`);
  }
});
