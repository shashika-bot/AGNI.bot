const config = require('../config');
const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
  pattern: "ytmp3",
  category: "downloader",
  react: "🎥",
  desc: "Download YouTube audios as MP3",
  filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return await reply('❌ Please provide a YouTube audio URL.\n\nExample: *.ytmp3 https://youtu.be/dQw4w9WgXcQ*');

    const response = await fetch(`https://dark-shan-yt.koyeb.app/download/ytmp3?url=${encodeURIComponent(q)}`);
    const data = await response.json();

    if (!data.status) return await reply('⚠️ Failed to fetch audio. Please check the link.');

    const audio = data.data;

    // same style caption as your example
    const message = `
 /)  /)  ~ ┏━━━━━━━━━━━━━━━━━┓
( •-• )  ~ ♡ 𝐘𝐓 𝐒𝐎𝐍𝐆 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ♡
/づづ ~ ┗━━━━━━━━━━━━━━━━━┛    

╭━━━━━━━━━●●►
┢😊 𝐓𝐢𝐭𝐥𝐞: ${audio.title}
┢😉 𝐅𝐨𝐫𝐦𝐚𝐭: ${audio.format}
┢🥴 𝐓𝐢𝐦𝐞: ${audio.timestump || 'N/A'}
┢😑 𝐔𝐩𝐥𝐨𝐚𝐝𝐞𝐝: ${audio.ago || 'N/A'}
┢😐 𝐕𝐢𝐞𝐰𝐬: ${audio.views || 'N/A'}
┢🥰 𝐋𝐢𝐤𝐞𝐬: ${audio.likes || 'N/A'}
╰━━━━━━━━●●►
   » [𒆜 ßÄÐkï††¥ 𒆜] «
  0:00 ─〇───── 0:47
b ⇄   ◃◃   ⅠⅠ   ▹▹   ↻
        `;

    // send thumbnail + caption
    await conn.sendMessage(from, {
      image: { url: audio.thumbnail },
      caption: message
    }, { quoted: mek });

    // send audio file as document
    await conn.sendMessage(from, {
      document: { url: audio.download },
      mimetype: 'audio/mp3',
      fileName: `${audio.title}.mp3`,
      caption: `Shashika`
    }, { quoted: mek });

    // react success
    await conn.sendMessage(from, {
      react: { text: '✅', key: mek.key }
    });

  } catch (e) {
    console.error(e);
    await reply(`📕 An error occurred: ${e.message}`);
  }
});
