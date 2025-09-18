const { proto, downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys')
const fs = require('fs')

// Media downloader
const downloadMediaMessage = async (m, filename) => {
    if (m.type === 'viewOnceMessage') m.type = m.msg.type

    const typeMap = {
        imageMessage: 'image',
        videoMessage: 'video',
        audioMessage: 'audio',
        stickerMessage: 'sticker',
        documentMessage: 'document'
    }

    const extMap = {
        audioMessage: '.mp3',
        imageMessage: '.jpg',
        videoMessage: '.mp4',
        stickerMessage: '.webp'
    }

    const type = typeMap[m.type]
    if (!type) return null

    let name = filename ? filename : 'undefined'
    if (m.type === 'documentMessage') {
        const ext = m.msg.fileName.split('.').pop()
        name += '.' + ext
    } else {
        name += extMap[m.type] || ''
    }

    const stream = await downloadContentFromMessage(m.msg, type)
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
    fs.writeFileSync(name, buffer)
    return fs.readFileSync(name)
}

// Main message parser
const sms = (danuwa, m) => {
    if (m.key) {
        m.id = m.key.id
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = m.fromMe
            ? danuwa.user.id.split(':')[0] + '@s.whatsapp.net'
            : m.isGroup
            ? m.key.participant
            : m.key.remoteJid
    }

    if (m.message) {
        m.type = getContentType(m.message)
        m.msg =
            m.type === 'viewOnceMessage'
                ? m.message[m.type].message[getContentType(m.message[m.type].message)]
                : m.message[m.type]

        if (m.msg) {
            if (m.type === 'viewOnceMessage') m.msg.type = getContentType(m.message[m.type].message)

            const tagMention = m.msg.contextInfo?.mentionedJid ?? []
            const quotedMention = m.msg.contextInfo?.participant ?? ''
            m.mentionUser = Array.isArray(tagMention) ? [...tagMention, quotedMention].filter(x => x) : [tagMention, quotedMention].filter(x => x)

            m.body =
                m.type === 'conversation'
                    ? m.msg
                    : m.type === 'extendedTextMessage'
                    ? m.msg.text
                    : (m.type === 'imageMessage' || m.type === 'videoMessage') && m.msg.caption
                    ? m.msg.caption
                    : (m.type === 'templateButtonReplyMessage' && m.msg.selectedId) || (m.type === 'buttonsResponseMessage' && m.msg.selectedButtonId)
                    ? m.msg.selectedId || m.msg.selectedButtonId
                    : ''

            // Quoted message handler
            m.quoted = m.msg.contextInfo?.quotedMessage ?? null
            if (m.quoted) {
                m.quoted.type = getContentType(m.quoted)
                m.quoted.id = m.msg.contextInfo.stanzaId
                m.quoted.sender = m.msg.contextInfo.participant
                m.quoted.fromMe = m.quoted.sender.split('@')[0].includes(danuwa.user.id.split(':')[0])
                m.quoted.msg =
                    m.quoted.type === 'viewOnceMessage'
                        ? m.quoted[m.quoted.type].message[getContentType(m.quoted[m.quoted.type].message)]
                        : m.quoted[m.quoted.type]
                if (m.quoted.type === 'viewOnceMessage') m.quoted.msg.type = getContentType(m.quoted[m.quoted.type].message)

                const qTag = m.quoted.msg.contextInfo?.mentionedJid ?? []
                const qQuoted = m.quoted.msg.contextInfo?.participant ?? ''
                m.quoted.mentionUser = Array.isArray(qTag) ? [...qTag, qQuoted].filter(x => x) : [qTag, qQuoted].filter(x => x)

                // ✅ Updated for latest Baileys
                m.quoted.fakeObj = proto.WebMessageInfo.create({
                    key: {
                        remoteJid: m.chat,
                        fromMe: m.quoted.fromMe,
                        id: m.quoted.id,
                        participant: m.quoted.sender
                    },
                    message: m.quoted
                })

                m.quoted.download = (filename) => downloadMediaMessage(m.quoted, filename)
                m.quoted.delete = () => danuwa.sendMessage(m.chat, { delete: m.quoted.fakeObj.key })
                m.quoted.react = (emoji) => danuwa.sendMessage(m.chat, { react: { text: emoji, key: m.quoted.fakeObj.key } })
            }
        }

        m.download = (filename) => downloadMediaMessage(m, filename)
    }

    // Reply helpers
    m.reply = (text, id = m.chat, option = { mentions: [m.sender] }) =>
        danuwa.sendMessage(id, { text, contextInfo: { mentionedJid: option.mentions } }, { quoted: m })
    m.replyImg = (img, text, id = m.chat, option = { mentions: [m.sender] }) =>
        danuwa.sendMessage(id, { image: img, caption: text, contextInfo: { mentionedJid: option.mentions } }, { quoted: m })
    m.replyVid = (vid, text, id = m.chat, option = { mentions: [m.sender], gif: false }) =>
        danuwa.sendMessage(id, { video: vid, caption: text, gifPlayback: option.gif, contextInfo: { mentionedJid: option.mentions } }, { quoted: m })
    m.replyAud = (aud, id = m.chat, option = { mentions: [m.sender], ptt: false }) =>
        danuwa.sendMessage(id, { audio: aud, ptt: option.ptt, mimetype: 'audio/mpeg', contextInfo: { mentionedJid: option.mentions } }, { quoted: m })
    m.replyDoc = (doc, id = m.chat, option = { mentions: [m.sender], filename: 'undefined.pdf', mimetype: 'application/pdf' }) =>
        danuwa.sendMessage(id, { document: doc, mimetype: option.mimetype, fileName: option.filename, contextInfo: { mentionedJid: option.mentions } }, { quoted: m })
    m.react = (emoji) => danuwa.sendMessage(m.chat, { react: { text: emoji, key: m.key } })

    return m
}

module.exports = { sms, downloadMediaMessage }
