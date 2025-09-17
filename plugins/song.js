// plugins/song.js
const { cmd } = require('../command');
const yts = require('yt-search');
const fetch = require('node-fetch');

// search results store
let searchStore = {};

cmd({
  pattern: "song",
  category: "downloader",
  react: "🎶",
  desc: "Search and download YouTube songs",
  filename: __filename
},
async (conn, mek, m, {
  from, q, reply
}) => {
  try {
    if (!q) return await reply("💡 Use: *.song despacito*");

    let search = await yts(q);
    let videos = search.videos.slice(0, 5);

    if (videos.length === 0) return await reply("❌ No results found.");

    let msg = "🎶 *SEARCH RESULTS*\n\n";
    videos.forEach((v, i) => {
      msg += `${i + 1}. ${v.title}\n   ⏱ ${v.timestamp} | 👁 ${v.views}\n\n`;
    });
    msg += "_Reply with a number to download._";

    // send search result message
    let sentMsg = await conn.sendMessage(from, { text: msg }, { quoted: mek });

    // save results in store
    searchStore[from] = {
      key: sentMsg.key.id,
      results: videos
    };

  } catch (e) {
    console.error(e);
    await reply("⚠️ Error: " + e.message);
  }
});

// reply handler
cmd({
  on: "message"
}, async (conn, mek, m, { from, body, reply }) => {
  try {
    if (!m.quoted) return;
    let store = searchStore[from];
    if (!store) return;
    if (m.quoted.id !== store.key) return;

    let choice = parseInt(m.body.trim());
    if (isNaN(choice) || choice < 1 || choice > store.results.length) {
      return await reply("❌ Invalid choice. Reply with 1–5.");
    }

    let video = store.results[choice - 1];
    await reply(`⏳ Downloading *${video.title}*...`);

    // fetch download link
    let res = await fetch(`https://dark-shan-yt.koyeb.app/download/ytmp3?url=${video.url}`);
    let data = await res.json();

    if (!data.status) return await reply("❌ Failed to get download link.");

    let audio = data.data;

    // send details
    await conn.sendMessage(from, {
      image: { url: audio.thumbnail },
      caption: `🎶 *${audio.title}*\n📥 Downloading MP3...`
    }, { quoted: mek });

    // send audio file
    await conn.sendMessage(from, {
      document: { url: audio.download },
      mimetype: 'audio/mp3',
      fileName: `${audio.title}.mp3`
    }, { quoted: mek });

    await conn.sendMessage(from, {
      react: { text: '✅', key: mek.key }
    });

    // clear store
    delete searchStore[from];

  } catch (e) {
    console.error(e);
    await reply("⚠️ Error: " + e.message);
  }
});
