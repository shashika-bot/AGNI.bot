const { cmd , commands } = require('../command')
const fg = require('api-dylux')
const yts = require('yt-search')

//===== SONG DOWNLOADER =====//
cmd({
    pattern: "song",
    desc: "song download",
    category: "download",
    filename: __filename
},
async(conn, mek, m,{from, q, reply}) => {
try {
    if(!q) return reply("❌ Please enter a url or song name")

    const search = await yts(q)
    const data = search.videos[0];
    const url = data.url

    let desc = `
/)  /)  ~ ┏━━━━━━━━━━━━━━━━━┓
( •-• )  ~ ♡ 𝐘𝐓 𝐒𝐎𝐍𝐆 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ♡
/づづ ~ ┗━━━━━━━━━━━━━━━━━┛    
╭━━━━━━━━━●●►
┢😊 𝐓𝐢𝐭𝐥𝐞: ${data.title}
┢🥴 𝐓𝐢𝐦𝐞: ${data.timestamp}
┢😑 𝐔𝐩𝐥𝐨𝐚𝐝𝐞𝐝: ${data.ago}
┢😐 𝐕𝐢𝐞𝐰𝐬: ${data.views}
╰━━━━━━━━●●►
   » [𒆜 agni 𒆜] «
  0:00 ─〇───── 0:47
b ⇄   ◃◃   ⅠⅠ   ▹▹   ↻
`

    await conn.sendMessage(from, { image: { url: data.thumbnail }, caption: desc }, { quoted: mek })

    // download audio
    let down = await fg.yta(url)
    let downloadurl = down.dl_url || down.result || down.audio || down.url || null

    if (!downloadurl) {
        return reply("❌ Could not fetch audio download link!")
    }

    await conn.sendMessage(from, { audio: { url: downloadurl }, mimetype: "audio/mpeg" }, { quoted: mek })
    await conn.sendMessage(from, { document: { url: downloadurl }, mimetype: "audio/mpeg", fileName: data.title + ".mp3", caption: " by agni bot " }, { quoted: mek })

} catch(e) {
    console.log(e)
    reply(`${e}`)
}
})


//===== VIDEO DOWNLOADER =====//
cmd({
    pattern: "video",
    desc: "video download",
    category: "download",
    filename: __filename
},
async(conn, mek, m,{from, q, reply}) => {
try {
    if(!q) return reply("❌ Please enter a url or video name")

    const search = await yts(q)
    const data = search.videos[0];
    const url = data.url

    let desc = `
 /)  /)  ~ ┏━━━━━━━━━━━━━━━━━┓
( •-• )  ~ ♡   𝐘𝐓 𝐕𝐈𝐃𝐄𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ♡
/づづ ~ ┗━━━━━━━━━━━━━━━━━┛    
╭━━━━━━━━━●●►
┢😊 𝐓𝐢𝐭𝐥𝐞: ${data.title}
┢🥴 𝐓𝐢𝐦𝐞: ${data.timestamp}
┢😑 𝐔𝐩𝐥𝐨𝐚𝐝𝐞𝐝: ${data.ago}
┢😐 𝐕𝐢𝐞𝐰𝐬: ${data.views}
╰━━━━━━━━●●►
   » [𒆜 agni 𒆜] «
  0:00 ─〇───── 0:47
b ⇄   ◃◃   ⅠⅠ   ▹▹   ↻
`

    await conn.sendMessage(from, { image: { url: data.thumbnail }, caption: desc }, { quoted: mek })

    // download video
    let down = await fg.ytv(url)
    let downloadurl = down.dl_url || down.result || down.video || down.url || null

    if (!downloadurl) {
        return reply("❌ Could not fetch video download link!")
    }

    await conn.sendMessage(from, { video: { url: downloadurl }, mimetype: "video/mp4" }, { quoted: mek })
    await conn.sendMessage(from, { document: { url: downloadurl }, mimetype: "video/mp4", fileName: data.title + ".mp4", caption: " by agni bot" }, { quoted: mek })

} catch(e) {
    console.log(e)
    reply(`${e}`)
}
})
