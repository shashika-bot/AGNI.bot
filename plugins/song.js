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
async (conn, mek, m, { from, q, reply }) => {
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
      step: "choose",
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
    let store = searchStore[from];
    if (!store) return;
    if (!m.quoted) return;
    if (m.quoted.key?.id !== store.key) return;

    let text = body.trim();

    // step 1: user chooses video
    if (store.step === "choose") {
      let choice = parseInt(text.replace(/[^0-9]/g, ""));
      if (isNaN(choice) || choice < 1 || choice > store.results.length) {
        return await reply("❌ Invalid choice. Reply with 1–5.");
      }
      store.video = store.results[choice - 1];
      store.step = "format";

      await reply(`📥 Selected: *${store.video.title}*\n\nChoose format:\n\n🎵 audio\n📄 document\n📝 lyrics`);
      return;
    }

    // step 2: user chooses format
    if (store.step === "format") {
      let video = store.video;
      let format = text.toLowerCase();

      if (!["audio", "document", "lyrics"].includes(format)) {
        return await reply("❌ Invalid format. Type: audio / document / lyrics");
      }

      await reply(`⏳ Downloading *${video.title}* as ${format}...`);

      // fetch download link
      let res = await fetch(`https://dark-shan-yt.koyeb.app/download/ytmp3?url=${video.url}`);
      if (!res.ok) return await reply("⚠️ API request failed.");
      let data = await res.json();
      if (!data.status) return await reply("❌ Failed to get download link.");

      let audio = data.data;

      // send preview
      await conn.sendMessage(from, {
        image: { url: audio.thumbnail },
        caption: `🎶 *${audio.title}*`
      }, { quoted: mek });

      if (format === "audio") {
        await conn.sendMessage(from, {
          audio: { url: audio.download },
          mimetype: 'audio/mpeg',
          fileName: `${audio.title}.mp3`,
          ptt: false
        }, { quoted: mek });
      }

      if (format === "document") {
        await conn.sendMessage(from, {
          document: { url: audio.download },
          mimetype: 'audio/mpeg',
          fileName: `${audio.title}.mp3`
        }, { quoted: mek });
      }

      if (format === "lyrics") {
        // try to get lyrics (using video.title as query)
        let lyricRes = await fetch(`https://dark-shan-yt.koyeb.app/lyrics?query=${encodeURIComponent(video.title)}`);
        if (lyricRes.ok) {
          let lyricData = await lyricRes.json();
          if (lyricData.status && lyricData.data) {
            await reply(`📖 *Lyrics for ${video.title}*\n\n${lyricData.data}`);
          } else {
            await reply("❌ Lyrics not found.");
          }
        } else {
          await reply("⚠️ Lyrics API error.");
        }
      }

      await conn.sendMessage(from, {
        react: { text: '✅', key: mek.key }
      });

      // clear store
      delete searchStore[from];
    }

  } catch (e) {
    console.error(e);
    await reply("⚠️ Error: " + e.message);
  }
});
