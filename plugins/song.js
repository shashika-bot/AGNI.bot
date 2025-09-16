const {cmd} = require('../command')
const ytdl = require("ytdl-core")
const yts = require("yt-search")
const fs = require("fs")

// Temporary memory to keep search results
let songSearchCache = {}

cmd({
    pattern: "song",
    desc: "Search and download songs.",
    category: "download",
    filename: __filename
},
async(conn, mek, m,{from, q, reply, sender}) => {
try{
    if(!q) return reply("🎶 Please give me song name or YouTube link!")

    // If user gave a YouTube link → download directly
    if(q.includes("youtube.com") || q.includes("youtu.be")){
        return downloadSong(q, conn, from, mek, reply)
    }

    // Otherwise → search
    let search = await yts(q)
    if(!search.videos || !search.videos.length) return reply("❌ No results found!")

    let results = search.videos.slice(0, 5) // top 5
    let listText = "🎶 *Search Results:*\n\n"
    results.forEach((v, i) => {
        listText += `${i+1}. ${v.title} [${v.timestamp}]\n`
    })
    listText += `\n👉 Reply with a number (1-${results.length}) to download.`

    // Save results in cache
    songSearchCache[from] = results

    reply(listText)

}catch(e){
    console.log(e)
    reply(`${e}`)
}
})

// Listen for replies
cmd({
    pattern: "reply",
    dontAddCommandList: true
}, async(conn, mek, m,{from, body, reply}) => {
    if(!songSearchCache[from]) return
    let choice = parseInt(body.trim())
    if(isNaN(choice) || choice < 1 || choice > songSearchCache[from].length){
        return reply("❌ Invalid choice! Reply with a valid number.")
    }

    let video = songSearchCache[from][choice-1]
    delete songSearchCache[from] // clear cache after selection

    await downloadSong(video.url, conn, from, mek, reply)
})

// Function to download song
async function downloadSong(url, conn, from, mek, reply){
    try{
        let info = await ytdl.getInfo(url)
        let title = info.videoDetails.title
        let file = `./temp/${title}.mp3`

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
