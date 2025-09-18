const {cmd , commands} = require('../command')
const fg = require('api-dylux')
const yts = require('yt-search')
cmd({
    pattern: "song",
    desc: "song download",
    category: "download",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if(!q) return("please enter a url or song name")
const search = await yts(q)
const data = search.videos[0];
const url = data.url

let desc = '
/)  /)  ~ ┏━━━━━━━━━━━━━━━━━┓
( •-• )  ~ ♡ 𝐘𝐓 𝐒𝐎𝐍𝐆 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ♡
/づづ ~ ┗━━━━━━━━━━━━━━━━━┛    
╭━━━━━━━━━●●►
┢😊 𝐓𝐢𝐭𝐥𝐞: ${data.title}
┢🥴 𝐓𝐢𝐦𝐞: ${data.timestump}
┢😑 𝐔𝐩𝐥𝐨𝐚𝐝𝐞𝐝: ${audio.ago}
┢😐 𝐕𝐢𝐞𝐰𝐬: ${audio.views}
┢🥰 𝐋𝐢𝐤𝐞𝐬: ${audio.likes}
╰━━━━━━━━●●►
   » [𒆜 agni 𒆜] «
  0:00 ─〇───── 0:47
b ⇄   ◃◃   ⅠⅠ   ▹▹   ↻
'
await conn.sendMessage(from,{image:{url: data.thumbnail}, Captain:desc},{quoted:mek}):
//download audio song

let down = await fg.yta(url)
let downloadurl = down.dl_url

//audio massage
await conn.sendMessage(from,{audio: {url:downloadurl},mimetype:"audio/mpeg"},{quoted:mek})
await conn.sendMessage(from,{document: {url:downloadurl},mimetype:"audio/mpeg",fileName:data.title + ".mp3", caption:" by agni bot "},{quoted:mek})

}catch(e){
console.log(e
reply('${e}')
}
})


//=====video downloader======

cmd({
    pattern: "video",
    desc: "video download",
    category: "download",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if(!q) return("please enter a url or video name")
const search = await yts(q)
const data = search.videos[0];
const url = data.url

let desc = '
 /)  /)  ~ ┏━━━━━━━━━━━━━━━━━┓
( •-• )  ~ ♡   𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ♡
/づづ ~ ┗━━━━━━━━━━━━━━━━━┛    
╭━━━━━━━━━●●►
┢😊 𝐓𝐢𝐭𝐥𝐞: ${data.title}
┢🥴 𝐓𝐢𝐦𝐞: ${data.timestump}
┢😑 𝐔𝐩𝐥𝐨𝐚𝐝𝐞𝐝: ${audio.ago}
┢😐 𝐕𝐢𝐞𝐰𝐬: ${audio.views}
┢🥰 𝐋𝐢𝐤𝐞𝐬: ${audio.likes}
╰━━━━━━━━●●►
   » [𒆜 agni 𒆜] «
  0:00 ─〇───── 0:47
b ⇄   ◃◃   ⅠⅠ   ▹▹   ↻
'
await conn.sendMessage(from,{image:{url: data.thumbnail}, Captain:desc},{quoted:mek}):
//download video

let down = await fg.ytv(url)
let downloadurl = down.dl_url

//video massage
await conn.sendMessage(from,{video: {url:downloadurl},mimetype:"video/mp4"},{quoted:mek})
await conn.sendMessage(from,{document: {url:downloadurl},mimetype:"video/mp4",fileName:data.title + ".mp4",caption:" by agni bot"},{quoted:mek})

}catch(e){
console.log(e
reply('${e}')
}
})
