const {cmd} = require('../command')
const ytdl = require("ytdl-core")
const yts = require("yt-search")
const fs = require("fs")

// Cache to keep search results by user
let songCache = {}

cmd({
    pattern: "song",
    desc: "Search and download songs.",
    category: "download",
    filename: __filename
},
async(conn, mek, m,{from, q, reply, sender}) => {
try{
    if(!q) return reply("🎶 Please give me a song name or YouTube link!")

    // If it's a YouTube link → direct download
    if(q.includes("youtube.com") || q.includes("youtu.be")){
        return downloadSong(q, conn, from, mek, reply)
    }

    // Otherwise search songs
    let search = await yts(q)
    if(!search.videos || !search.videos.length) return reply("❌ No results found!")

    let results = search.videos.slice(0, 5) // only 5 results
    let listText = "🎶 *Search Results:*\n\n"
    results.forEach((v, i) => {
        listText += `${i+1}. ${v.title} [${v.timestamp}]\n`
    })
    listText += `\n👉 Reply with a number (1-${results.length}) to download.`

    // Save results in cache for this chat
    songCache[from] = results

    await conn.sendMessage(from, { text: listText }, { quoted: mek })

}catch(e){
    console.log(e)
    reply(`${e}`)
}
})

// Listen for numeric replies (1-5)
cmd({
    pattern: ".*", // catch all
    dontAddCommandList: true
}, async(conn, mek, m,{from, body, reply}) => {
    if(!songCache[from]) return

    let choice = parseInt(body.trim())
    if(isNaN(choice)) return // not a number, ignore

    let results = songCache[from]
    if(choice < 1 || choice > results.length){
        return reply(`❌ Invalid choice. Reply with 1-${results.length}`)
    }

    let video = results[choice-1]
    delete songCache[from] // clear cache after use

    await downloadSong(video.url, conn, from, mek, reply)
})

// Download function
async function downloadSong(url, conn, from, mek, reply){
    try{
        let info = await ytdl.getInfo(url)
        let title = info.videoDetails.title
        let file = `./temp/${Date.now()}.mp3`

        reply(`⬇️ Downloading: *${title}*`)

        ytdl(url, { filter: "audioonly", quality: "highestaudio" })
            .pipe(fs.createWriteStream(file))
            .on("finish", async () => {
                await conn.sendMessage(from, { 
                    audio: fs.readFileSync(file), 
                    mimetype: "audio/mpeg", 
                    fileName: `${title}.mp3` 
                }, { quoted: mek })
                fs.unlinkSync(file)
            })
    }catch(e){
        console.log(e)
        reply(`${e}`)
    }
        }
