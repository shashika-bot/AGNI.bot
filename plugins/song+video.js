const { cmd } = require('../command')
const fg = require('api-dylux')
const yts = require('yt-search')

//===== HELPER FUNCTION =====//
const getFirstVideo = async (query, reply) => {
    const search = await yts(query)
    if (!search?.videos?.length) return null
    return search.videos[0]
}

//===== SONG DOWNLOADER =====//
cmd({
    pattern: "song",
    desc: "Download audio from YouTube",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please enter a URL or song name")

        const data = await getFirstVideo(q, reply)
        if (!data) return reply("❌ No video found!")

        const url = data?.url
        if (!url) return reply("❌ Could not get video URL!")

        let desc = `
/)  /)  ~ ┏━━━━━━━━━━━━━━━━━┓
( •-• )  ~ ♡ 𝐘𝐓 𝐒𝐎𝐍𝐆 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ♡
/づづ ~ ┗━━━━━━━━━━━━━━━━━┛    
╭━━━━━━━━━●●►
┢😊 Title: ${data.title}
┢🥴 Duration: ${data.timestamp}
┢😑 Uploaded: ${data.ago}
┢😐 Views: ${data.views}
╰━━━━━━━━●●►
`

        await conn.sendMessage(from, { image: { url: data.thumbnail }, caption: desc }, { quoted: mek })

        // download audio safely
        let down
        try {
            down = await fg.yta(url)
        } catch {
            return reply("❌ Failed to fetch audio!")
        }

        let downloadurl = down?.dl_url || down?.result || down?.audio || down?.url || null
        if (!downloadurl) return reply("❌ Could not fetch audio download link!")

        await conn.sendMessage(from, { audio: { url: downloadurl }, mimetype: "audio/mpeg" }, { quoted: mek })
        await conn.sendMessage(from, { document: { url: downloadurl }, mimetype: "audio/mpeg", fileName: data.title + ".mp3", caption: "by agni bot" }, { quoted: mek })

    } catch (e) {
        console.log(e)
        reply(`❌ Error: ${e.message || e}`)
    }
})

//===== VIDEO DOWNLOADER =====//
cmd({
    pattern: "video",
    desc: "Download video from YouTube",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please enter a URL or video name")

        const data = await getFirstVideo(q, reply)
        if (!data) return reply("❌ No video found!")

        const url = data?.url
        if (!url) return reply("❌ Could not get video URL!")

        let desc = `
 /)  /)  ~ ┏━━━━━━━━━━━━━━━━━┓
( •-• )  ~ ♡ 𝐘𝐓 𝐕𝐈𝐃𝐄𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ♡
/づづ ~ ┗━━━━━━━━━━━━━━━━━┛    
╭━━━━━━━━━●●►
┢😊 Title: ${data.title}
┢🥴 Duration: ${data.timestamp}
┢😑 Uploaded: ${data.ago}
┢😐 Views: ${data.views}
╰━━━━━━━━●●►
`

        await conn.sendMessage(from, { image: { url: data.thumbnail }, caption: desc }, { quoted: mek })

        // download video safely
        let down
        try {
            down = await fg.ytv(url)
        } catch {
            return reply("❌ Failed to fetch video!")
        }

        let downloadurl = down?.dl_url || down?.result || down?.video || down?.url || null
        if (!downloadurl) return reply("❌ Could not fetch video download link!")

        await conn.sendMessage(from, { video: { url: downloadurl }, mimetype: "video/mp4" }, { quoted: mek })
        await conn.sendMessage(from, { document: { url: downloadurl }, mimetype: "video/mp4", fileName: data.title + ".mp4", caption: "by agni bot" }, { quoted: mek })

    } catch (e) {
        console.log(e)
        reply(`❌ Error: ${e.message || e}`)
    }
})
