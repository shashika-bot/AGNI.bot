const {cmd} = require('../command')
const ytdl = require("ytdl-core")
const yts = require("yt-search")
const fs = require("fs")

// Cache to keep search results per chat
let songCache = {}
let downloadCache = {}

cmd({
    pattern: "song",
    desc: "Search and download songs.",
    category: "download",
    filename: __filename
},
async(conn, mek, m,{from, q, reply}) => {
try{
    if(!q) return reply("🎶 Please give me a song name or YouTube link!")

    // If YouTube link → direct download
    if(q.includes("youtube.com") || q.includes("youtu.be")){
        return askFormat(q, conn, from, mek, reply)
    }

    // Otherwise search
    let search = await yts(q)
    if(!search.videos || !search.videos.length) return reply("❌ No results found!")

    let results = search.videos.slice(0, 5) // top 5
    let listText = "🎶 *Search Results:*\n\n"
    results.forEach((v, i) => {
        listText += `${i+1}. ${v.title} [${v.timestamp}]\n`
    })
    listText += `\n👉 Reply with a number (1-${results.length}) to download.`

    // Save results in cache for this chat
    songCache[from] = {
        results,
        key: mek.key // keep message key for reply check
    }

    await conn.sendMessage(from, { text: listText }, { quoted: mek })

}catch(e){
    console.log(e)
    reply(`${e}`)
}
})

// Reply handler (search results + format choice)
cmd({
    pattern: ".*",
    dontAddCommandList: true
}, async(conn, mek, m,{from, body, reply}) => {
    // ✅ Step 1: If replying to search results
    if(songCache[from]){
        let quoted = mek.message?.extendedTextMessage?.contextInfo
        if(!quoted || quoted.stanzaId !== songCache[from].key.id) return

        let choice = parseInt(body.trim())
        if(isNaN(choice)) return // not a number → ignore

        let results = songCache[from].results
        if(choice < 1 || choice > results.length){
            return reply(`❌ Invalid choice. Reply with 1-${results.length}`)
        }

        let video = results[choice-1]
        delete songCache[from] // clear after use

        return askFormat(video.url, conn, from, mek, reply)
    }

    // ✅ Step 2: If replying to format choice
    if(downloadCache[from]){
        let quoted = mek.message?.extendedTextMessage?.contextInfo
        if(!quoted || quoted.stanzaId !== downloadCache[from].key.id) return

        let choice = parseInt(body.trim())
        if(isNaN(choice)) return

        let { url } = downloadCache[from]
        delete downloadCache[from]

        if(choice === 1){
            return downloadSong(url, conn, from, mek, reply, "audio")
        } else if(choice === 2){
            return downloadSong(url, conn, from, mek, reply, "document")
        } else {
            return reply("❌ Invalid choice. Reply with 1 (Audio) or 2 (Document)")
        }
    }
})

// Function to ask format
async function askFormat(url, conn, from, mek, reply){
    let msg = "✅ Song found!\n\n👉 Reply with:\n1. 🎵 Send as Audio\n2. 📄 Send as Document"
    downloadCache[from] = { url, key: mek.key }
    await conn.sendMessage(from, { text: msg }, { quoted: mek })
}

// Function to download a song
async function downloadSong(url, conn, from, mek, reply, mode){
    try{
        let info = await ytdl.getInfo(url)
        let title = info.videoDetails.title.replace(/[^\w\s]/gi, '')
        let file = `./temp/${Date.now()}.mp3`

        reply(`⬇️ Downloading: *${title}*`)

        ytdl(url, { filter: "audioonly", quality: "highestaudio" })
            .pipe(fs.createWriteStream(file))
            .on("finish", async () => {
                if(mode === "audio"){
                    await conn.sendMessage(from, { 
                        audio: fs.readFileSync(file), 
                        mimetype: "audio/mpeg", 
                        fileName: `${title}.mp3` 
                    }, { quoted: mek })
                } else {
                    await conn.sendMessage(from, { 
                        document: fs.readFileSync(file), 
                        mimetype: "audio/mpeg", 
                        fileName: `${title}.mp3` 
                    }, { quoted: mek })
                }
                fs.unlinkSync(file)
            })
    }catch(e){
        console.log(e)
        reply(`${e}`)
    }
}
