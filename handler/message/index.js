require('dotenv').config()
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
const fs = require('fs')
const { decryptMedia, namespace} = require('@open-wa/wa-automate')
const user = JSON.parse(fs.readFileSync('./database/json/user.json'))
const { downloader, urlShortener, images, rugaapi, igStalk, wiki} = require('../../lib')
const { msgFilter, color, processTime, is } = require('../../utils')
const mentionList = require('../../utils/mention')
const { uploadImages } = require('../../utils/fetcher')
const { fetchJson } = require('../../lib/fetcher')
const { menuId, menuEn } = require('./text') // Indonesian & English menu
const { spawn, exec } = require('child_process')
const {getBuffer} = require('../../lib/functions')
const axios = require('axios')
const { send } = require('process')
const { video } = require('tiktok-scraper')
const { MessageTypes } = require('@open-wa/wa-automate/dist/api/model/message')
module.exports = msgHandler = async ( client, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, isGif, mimetype, quotedMsg, quotedMsgObj, mentionedJidList, isGroup } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName // verifiedName is the name of someone who uses a business account
        const botNumber = await client.getHostNumber() + '@c.us'
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const groupMembers = isGroupMsg ? await client.getGroupMembersId(groupId) : ''
        const isGroupAdmins = groupAdmins.includes(sender.id) || false
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
        // Bot Prefix
        const prefix = '#'
        body = (type === 'chat' && body.startsWith(prefix)) ? body : (((type === 'image' || type === 'video') && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const arg = body.substring(body.indexOf(' ') + 1)
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image'
        const url = args.length !== 0 ? args[0] : ''
        const uaOverride = process.env.UserAgent

        // [BETA] Avoid Spam Message
        if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        //
        if (!isCmd && !isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname)) }
        if (!isCmd && isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname), 'in', color(name || formattedTitle)) }
        if (isCmd && !isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        // [BETA] Avoid Spam Message
        msgFilter.addFilter(from)

        switch (command) {
        // Menu and TnC
        case 'hltv':
            await client.sendText(from, '*#byano* - Para enviar a frase do dono da p*rra toda.\n\n *#let* - Para evniar a frase da torcedora mais astraliana do grupo.\n\n *#biel* - Para ver uma informação do bot. \n\n *#ze* - Bom dia cara.\n\n *#nunes ou #nunes2* - Para enviar as frases icônica do nosso adm.\n\n *#lucas* - Para enviar a frase do nosso adorável adm.\n\n *#fallen* - Para enviar o texto do nosso Professor, PRESENTE!.\n\n *#mama @mencione alguem* - Para fazer o membro mamar.\n\n*#tabanido* -  Para enviar a frase obrigatória antes do ban.\n\n *#safado @mencione alguem* - Para mencionar um torcedor SAFADO!(caso seja menina utilize *#safada*)', id)
            break
        case 'hltv2':
            if (args.length !=1) return client.reply(from, '*#caixeta* - Para enviar a frase do adm mais gostos de toda MEMEHLTV\n\n *#patri* - Para enviar a frase de membro comum.\n\n *#haze* - Para enviar a frase de outro membro comum. *#liviski* - Para enviar uma frase para os principais ADMs, Ostapoviski e Lima.', id)
          break
        case 'caixeta':
            await client.sendText(from, '*O Caixeta é conhecido como melhor ADM e carrega o título de membro mais belo do grupo!*')
            break
        case 'gamarra':
            await client.sendText(from, '*A Gamarra é conhecida pela sua esclerose lateral amiotrófica e pelo seu belo spray de tabela*', id)
            break
        case 'haze':
            await client.sendText(from,`*Sou Filho do Luís e dou pro Gabriel Nunes. By: Haze, Guilherme, Haze* `, id)
            break
        case 'patri':
            await client.sendText(from, `*Comedor de E-Girl, esquece padrin, de AK nao troca.*`, id)
            break    
        case 'liviski':
            await client.sendText(from, '*O Ostapoviski e o Lima, são gostosos demais* 🤤🤤', id)
            break
        case 'speed':
        case 'ping':
            await client.sendText(from, `Pong!!!!\nSpeed: ${processTime(t, moment())} _Second_`)
            break
        case 'biel':
            if (args.length != 1) return client.reply (from, '*_F DEV_*', id)
            break
        case 'let':
            await client.sendText(from, '*Cadê o cuzinho Nunes?🥰*', id)
            break
        case 'let2':
            await client.sendText(from, '*TA GAXXXXXXTANDO P$RRA*', id)
            break
        case 'ze':
            await client.sendText(from,'*Fala Zezé, bom dia cara.*', id)   
            break 
        case 'luan':
            await client.sendText(from,'*Luan é gay.*', id)
            break
        case 'gui':
            await client.sendPtt(from, './media/tts/Guilherme.mp3', id) 
            break
        case 'nunes2':
            if (args.length != 1) return client.reply (from, '*Cu do Nunes, Nada dele tudo nosso!*', id)
            break
        case 'nunes':
            await client.sendText(from, `*Por favor, parem de falar do meu cu!*`, id)
            break
        case 'lucas':
            await client.sendText(from, '*Seu cu!*', id)
            break
        case 'danilo':
            await client.sendText(from, '*Sulista dos pato lindo.*', id)
            break
        case 'botinutil':
            if (args.length != 1) return client.reply (from,'*Eu te amo*🥰', id)
            break
        case 'byano':
            if (args.length != 1) return client.reply (from, '*PODE TUDO NESSA MERDA!*', id)
            break
        case 'mama':
            await client.sendText(from, `*@${mentionedJidList[0].replace('@c.us', '')} Me mama*`)
            break
        case 'meme':
            await client.sendText(from, '*Vim pelo meme, fiquei pela aula.*', id)
            break
        case 'perdoa':
            await client.sendText(from, '*Eu disse que não viria, mas quem ama perdoa.*', id)   
            break
        case 'safado':
            await client.sendText(from,`*@${mentionedJidList[0].replace('@c.us', '')} Você é um torcedor safado!*`)    
            break
        case 'iludido':
            await client.sendText(from,' *Fui Iludido, vim de besta mesmo.* ', id)
            break
        case 'safada':
            await client.sendText(from,`*@${mentionedJidList[0].replace('@c.us', '')} Você é uma torcedora safada!*`)    
            break
        case 'fallen':
            await client.sendText(from, 'HAHAHAHA 🤣😂😂🤣😂🤣 LÁ VEM O FALLENZÃO 🇧🇷🍷🇧🇷🍷🇧🇷🍷🇧🇷🍷 CHEIO DE PAIXÃO 😘🥰😍😘🥰😍😘🥰😍 TICATA TICATA TICATA 🎵🎶🎵🎶 EU QUERO QUE O FALLEN 🍷🍷🍷🍷 ME AQUEÇA NESSE INVERNO ❄️❄️❄️❄️❄️❄️❄️ E QUE O INIMIGO VÁ PRO INFERNO 👺👿👺🔥🔥')    
            break
        case 'furia':
            if (args.length !=1) return client.reply(from, '🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤮🤮🤮🤮🤮🤮🤮🤮🤮🤮🤮🤮', id)
            break
      //AUDIOS
        case 'audios':
            await client.sendText(from, menuId.textAudios(pushname))
            break
            case 'tabanido':
            if (args.length !=1) return client.sendPtt(from, './media/tts/banidoBot.mp3', id)     
            break
            case 'nobru':
            case 'nobruapelão':    
            if (args.length !=1) return client.sendPtt(from, './media/tts/Nobru Estourado (Ave Maria Doido )_160k.mp3', id)    
            break 
            case 'yamate':
            if (args.length !=1) return client.sendPtt(from, './media/tts/Yamete Kudasai - Sound Effect HD _160k.mp3', id)    
            break
            case 'saudade':
            if (args.length !=1) return client.sendPtt(from, './media/tts/Faustão.mp3', id)
            break
            case 'macaco':
            if (args.length !=1) return client.sendPtt(from, './media/tts/macacosergio2.mp3', id)
            break
            case 'luan':
            if (args.length !=1) return client.sendPtt(from, './media/tts/Meme Audio Para Assustar LUAN GAMEPLAY_160k.mp3', id)
            break
            case 'hoje':
            if (args.length !=1) return client.sendPtt(from, './media/tts/jukes.mp3', id)
            break
            case 'jukes':
            if (args.length !=1) return client.sendPtt(from, './media/tts/tutaaqui.mp3', id)
            break
            case 'cena':
            if (args.length !=1) return client.sendPtt(from, './media/tts/JHON CENA _AUDIO ESTOURADO__160k.mp3', id)
            break
            case 'gta':
            if (args.length !=1) return client.sendPtt(from, './media/tts/musica do gta san andreas som estourado_160k.mp3', id)
            break
    //comandos normais
        case 'ajuda':
        case 'menu':
        case 'help':
        await client.sendText(from, menuId.textMenu(pushname))
                .then(() => ((isGroupMsg) && (isGroupAdmins)) ? client.sendText(from, 'Menu Admin Grup: *#astralis*') : null)
            break
        case 'astralis':
            if (!isGroupMsg) return client.reply(from, 'Desculpe, este comando só pode ser usado dentro de grupos! [Group Only]', id)
            if (!isGroupAdmins) return client.reply(from, 'Falha, este comando só pode ser usado por administradores de grupo! [Admin Group Only]', id)
            await client.sendText(from, menuId.textAdmin())
            break
            case 'tts':
                if (args.length === 1) return client.reply(from, 'Enviar comando *#Tts [id, en, jp, ar, pt, af, ca, zh, hr, de, it, la] [texto] *, por exemplo *#Tts id olá todos*')
                const ttsId = require('node-gtts')('id')
                const ttsEn = require('node-gtts')('en')
            const ttsJp = require('node-gtts')('ja')
                const ttsAr = require('node-gtts')('ar')
                const ttsPt = require('node-gtts')('pt')
                const ttsAf = require('node-gtts')('af')
                const ttsCa = require('node-gtts')('ca')
                const ttsZh = require('node-gtts')('zh')
                const ttsHr = require('node-gtts')('hr')
                const ttsDe = require('node-gtts')('de')
                const ttsIt = require('node-gtts')('it')
                const ttsLa = require('node-gtts')('la')
                const dataText = body.slice(8)
                if (dataText === '') return client.reply(from, 'Como?', id)
                if (dataText.length > 500) return client.reply(from, 'Texto muito longo!', id)
                var dataBhs = body.slice(5, 7)
                if (dataBhs == 'id') {
                    ttsId.save('./media/tts/resId.mp3', dataText, function () {
                        client.sendPtt(from, './media/tts/resId.mp3', id)
                    })
                } else if (dataBhs == 'en') {
                    ttsEn.save('./media/tts/resEn.mp3', dataText, function () {
                        client.sendPtt(from, './media/tts/resEn.mp3', id)
                    })
                } else if (dataBhs == 'jp') {
                    ttsJp.save('./media/tts/resJp.mp3', dataText, function () {
                        client.sendPtt(from, './media/tts/resJp.mp3', id)
                    })
            } else if (dataBhs == 'ar') {
                    ttsAr.save('./media/tts/resAr.mp3', dataText, function () {
                        client.sendPtt(from, './media/tts/resAr.mp3', id)
                    })
                }  else if (dataBhs == 'af') {
                    ttsAf.save('./media/tts/resAf.mp3', dataText, function () {
                        client.sendPtt(from, './media/tts/resAf.mp3', id)
                        })      
             }      else if (dataBhs == 'ca') {
                    ttsCa.save('./media/tts/resCa.mp3', dataText, function () {
                        client.sendPtt(from, './media/tts/resCa.mp3', id)
                        })         
                } else if (dataBhs == 'zh') {
                    ttsZh.save('./media/tts/resZh.mp3', dataText, function () {
                        client.sendPtt(from, './media/tts/resZh.mp3', id)
                        })         
                }else if (dataBhs == 'de') {
                    ttsDe.save('./media/tts/resDe.mp3', dataText, function () {
                        client.sendPtt(from, './media/tts/resDe.mp3', id)
                        })         
                }else if (dataBhs == 'it') {
                    ttsIt.save('./media/tts/resIt.mp3', dataText, function () {
                        client.sendPtt(from, './media/tts/resIt.mp3', id)
                        })         
                }else if (dataBhs == 'pt') {
                    ttsPt.save('./media/tts/resPt.mp3', dataText, function () {
                        client.sendPtt(from, './media/tts/resPt.mp3', id)
                        })         
                }else if (dataBhs == 'hr') {
                    ttsHr.save('./media/tts/resHr.mp3', dataText, function () {
                        client.sendPtt(from, './media/tts/resHr.mp3', id)
                        })         
                }else if (dataBhs == 'la') {
                    ttsLa.save('./media/tts/resLa.mp3', dataText, function () {
                        client.sendPtt(from, './media/tts/resLa.mp3', id)
                        })         
                }
                else {
                    client.reply(from, 'Insira os dados do idioma: [id] para indonésio, [en] para inglês, [jp] para japonês, [ar] para árabe, [pt] para português, [af] para africano, [ca] catalão, [zh] para chinês, [hr] para croata, [de] para alemão, [it] para italiano e [la] para latim.', id)
                }
                break   
        // Sticker Creator
        case 'stikertoimg':
            case 'stickertoimg':
            case 'stimg':
                    if (quotedMsg && quotedMsg.type == 'sticker') {
                        const mediaData = await decryptMedia(quotedMsg)
                        client.reply(from, `Sendo processado! Por favor espere um momento...`, id)
                        const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                        await client.sendFile(from, imageBase64, 'imgsticker.jpg', 'Sticker convertido em Imagem com sucesso!', id)
                        .then(() => {
                            console.log(`Sticker para imagem processada para ${processTime(t, moment())} Segundos`)
                        })
                } else if (!quotedMsg) return client.reply(from, `Formato incorreto, marque o adesivo que deseja usar como imagem!`, id)
                break     
        case 'sticker':
        case 'stiker': {
            if ((isMedia || isQuotedImage) && args.length === 0) {
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                client.sendImageAsSticker(from, imageBase64).then(() => {
                    client.reply(from, 'Aqui está seu sticker')
                    console.log(`Sticker processado para ${processTime(t, moment())} Segundos`)
                })
            } 
        }
        break
        case 'stickergif':
            case 'stikergif':
            case 'sgif':
                if (isMedia) {
                    if (mimetype === 'video/mp4' && message.duration < 10 || mimetype === 'image/gif' && message.duration < 10) {
                        const mediaData = await decryptMedia(message, uaOverride)
                        client.reply(from, '[WAIT] Em andamento⏳ aguarde ± 1 min!', id)
                        const filename = `./media/aswu.${mimetype.split('/')[1]}`
                        await fs.writeFileSync(filename, mediaData)
                        await exec(`gify ${filename} ./media/output.gif --fps=30 --scale=240:240`, async function (error, stdout, stderr) {
                            const gif = await fs.readFileSync('./media/output.gif', { encoding: "base64" })
                            await client.sendImageAsSticker(from, `data:image/gif;base64,${gif.toString('base64')}`)
                        })
                    } else (
                        client.reply(from, '[❗] Enviar vídeo com a legenda *#StickerGif * máximo de 10 segundos!', id)
                    )
                }
                break
        // Video Downloader
        case 'tiktok':
            if (args.length !== 1) return client.reply(from, 'Desculpe, o formato da mensagem está errado, por favor verifique o menu. [Formato incorreto]', id)
            if (!is.Url(url) && !url.includes('tiktok.com')) return client.reply(from, 'Desculpe, o link que você enviou é inválido. [Link inválido]', id)
            await client.reply(from, `_Coletando Dados..._ \n\n${menuId.textDonasi()}`, id)
            downloader.tiktok(url).then(async (videoMeta) => {
                const filename = videoMeta.authorMeta.name + '.mp4'
                const caps = `*Metadata:*\nUsername: ${videoMeta.authorMeta.name} \nMusic: ${videoMeta.musicMeta.musicName} \nView: ${videoMeta.playCount.toLocaleString()} \nLike: ${videoMeta.diggCount.toLocaleString()} \nComment: ${videoMeta.commentCount.toLocaleString()} \nShare: ${videoMeta.shareCount.toLocaleString()} \nCaption: ${videoMeta.text.trim() ? videoMeta.text : '-'}`
                await client.sendFileFromUrl(from, videoMeta.url, filename, videoMeta.NoWaterMark ? caps : `⚠ Vídeos sem marca d'água não estão disponíveis. \n\n${caps}`, '', { headers: { 'User-Agent': 'okhttp/4.5.0', referer: 'https://www.tiktok.com/' } }, true)
                    .then((serialized) => console.log(`Envio de arquivos com sucesso com id: ${serialized} processado durante ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            }).catch(() => client.reply(from, 'Falha ao buscar metadados, o link que você enviou é inválido. [Link inválido]', id))
            break
        case 'ig':
        case 'instagram':
            if (args.length !== 1) return client.reply(from, 'Desculpe, o formato da mensagem está errado, por favor verifique o menu. [Formato incorreto]', id)
            if (!is.Url(url) && !url.includes('instagram.com')) return client.reply(from, 'Desculpe, o link que você enviou é inválido. [Link inválido]', id)
            await client.reply(from, `_Coletando Dados..._`, id)
            downloader.insta(url).then(async (data) => {
                if (data.type == 'GraphSidecar') {
                    if (data.image.length != 0) {
                        data.image.map((x) => client.sendFileFromUrl(from, x, 'photo.jpg', '', null, null, true))
                            .then((serialized) => console.log(`Envio de arquivos com sucesso com id: ${serialized} processado durante ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                    if (data.video.length != 0) {
                        data.video.map((x) => client.sendFileFromUrl(from, x.videoUrl, 'video.mp4', '', null, null, true))
                            .then((serialized) => console.log(`Envio de arquivos com sucesso com id: ${serialized} processado durante ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                } else if (data.type == 'GraphImage') {
                    client.sendFileFromUrl(from, data.image, 'photo.jpg', '', null, null, true)
                        .then((serialized) => console.log(`Envio de arquivos com sucesso com id: ${serialized} processado durante ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                } else if (data.type == 'GraphVideo') {
                    client.sendFileFromUrl(from, data.video.videoUrl, 'video.mp4', '', null, null, true)
                        .then((serialized) => console.log(`Envio de arquivos com sucesso com id: ${serialized} processado durante ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                }
            })
                .catch((err) => {
                    console.log(err)
                    if (err === 'Não é um vídeo') { return client.reply(from, 'Erro, não há vídeo no link que você enviou. [Link inválido]', id) }
                    client.reply(from, 'Erro, usuário privado ou link errado [Link privado ou inválido]', id)
                })
            break
        case 'twt':
        case 'twitter':
            if (args.length !== 1) return client.reply(from, 'Desculpe, o formato da mensagem está errado, por favor verifique o menu. [Formato incorreto]', id)
            if (!is.Url(url) & !url.includes('twitter.com') || url.includes('t.co')) return client.reply(from, 'Desculpe, o url que você enviou é inválido. [Link inválido]', id)
            await client.reply(from, `_Coletando Dados..._`, id)
            downloader.tweet(url).then(async (data) => {
                if (data.type === 'video') {
                    const content = data.variants.filter(x => x.content_type !== 'application/x-mpegURL').sort((a, b) => b.bitrate - a.bitrate)
                    const result = await urlShortener(content[0].url)
                    console.log('Shortlink: ' + result)
                    await client.sendFileFromUrl(from, content[0].url, 'video.mp4', `Link para Download: ${result} \n\nProcessado para ${processTime(t, moment())} _Segundos_`, null, null, true)
                        .then((serialized) => console.log(`Envio de arquivos com ID com sucesso: ${serialized} processado durante ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                } else if (data.type === 'photo') {
                    for (let i = 0; i < data.variants.length; i++) {
                        await client.sendFileFromUrl(from, data.variants[i], data.variants[i].split('/media/')[1], '', null, null, true)
                            .then((serialized) => console.log(`Envio de arquivos com ID com sucesso: ${serialized} processado durante ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                }
            })
                .catch(() => client.sendText(from, 'Desculpe, o link é inválido ou não há mídia no link que você enviou. [Link inválido]'))
            break	
    	case 'yt':
        case 'youtube':
            if (args.length !== 1) return client.reply(from, 'Desculpe, o formato da mensagem está errado, por favor verifique o menu. [Formato incorreto]', id)
            if (!is.Url(url) && !url.includes('youtube.com')) return client.reply(from, 'Desculpe, o link que você enviou é inválido. [Link inválido]', id)
            await client.reply(from, `_Coletando Dados..._`, id)
            downloader.ytmp4(url).then(async (data) => {
                if (data.type == 'GraphSidecar') {
                    if (data.image.length != 0) {
                        data.image.map((x) => client.sendFileFromUrl(from, x, 'photo.jpg', '', null, null, true))
                            .then((serialized) => console.log(`Envio de arquivos com sucesso com id: ${serialized} processado durante ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                    if (data.video.length != 0) {
                        data.video.map((x) => client.sendFileFromUrl(from, x.videoUrl, 'video.mp4', '', null, null, true))
                            .then((serialized) => console.log(`Envio de arquivos com sucesso com id: ${serialized} processado durante ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                } else if (data.type == 'GraphImage') {
                    client.sendFileFromUrl(from, data.image, 'photo.jpg', '', null, null, true)
                        .then((serialized) => console.log(`Envio de arquivos com sucesso com id: ${serialized} processado durante ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                } else if (data.type == 'GraphVideo') {
                    client.sendFileFromUrl(from, data.video.videoUrl, 'video.mp4', '', null, null, true)
                        .then((serialized) => console.log(`Envio de arquivos com sucesso com id: ${serialized} processado durante ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                }
            })
                .catch((err) => {
                    console.log(err)
                    if (err === 'Não é um vídeo') { return client.reply(from, 'Erro, não há vídeo no link que você enviou. [Link inválido]', id) }
                    client.reply(from, 'Erro, usuário privado ou link errado [Link privado ou inválido]', id)
                })
            // Other Command
            case 'play': 
            if (args.length == 0) return client.reply(from, `Untuk mencari lagu dari youtube\n\nPenggunaan: ${prefix}play judul lagu`, id)
            axios.get(`https://arugaytdl.herokuapp.com/search?q=${body.slice(6)}`)
            .then(async (res) => {
                await client.sendFileFromUrl(from, `${res.data[0].thumbnail}`, ``, `Lagu ditemukan\n\nJudul: ${res.data[0].title}\nDurasi: ${res.data[0].duration}detik\nUploaded: ${res.data[0].uploadDate}\nView: ${res.data[0].viewCount}\n\nsedang dikirim`, id)
				rugaapi.ytmp3(`https://youtu.be/${res.data[0].id}`)
				.then(async(res) => {
					if (res.status == 'error') return client.sendFileFromUrl(from, `${res.link}`, '', `${res.error}`)
					await client.sendFileFromUrl(from, `${res.thumb}`, '', `Lagu ditemukan\n\nJudul ${res.title}\n\nSabar lagi dikirim`, id)
					await client.sendFileFromUrl(from, `${res.link}`, '', '', id)
					.catch(() => {
						client.reply(from, `URL Ini ${args[0]} Sudah pernah di Download sebelumnya. URL akan di Reset setelah 1 Jam/60 Menit`, id)
					})
				})
            })
            .catch(() => {
                client.reply(from, 'Ada yang Error!', id)
            })
            break
            case 'whatanime':
            if (isMedia && type === 'image' || quotedMsg && quotedMsg.type === 'image') {
                if (isMedia) {
                    var mediaData = await decryptMedia(message, uaOverride)
                } else {
                    var mediaData = await decryptMedia(quotedMsg, uaOverride)
                }
                const fetch = require('node-fetch')
                const imgBS4 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                client.reply(from, 'Procurando....', id)
                fetch('https://trace.moe/api/search', {
                    method: 'POST',
                    body: JSON.stringify({ image: imgBS4 }),
                    headers: { "Content-Type": "application/json" }
                })
                .then(respon => respon.json())
                .then(resolt => {
                	if (resolt.docs && resolt.docs.length <= 0) {
                		client.reply(from, 'Desculpe, não sei o que é este anime, certifique-se de que a imagem a ser pesquisada não está desfocada / cortada', id)
                	}
                    const { is_adult, title, title_chinese, title_romaji, title_english, episode, similarity, filename, at, tokenthumb, anilist_id } = resolt.docs[0]
                    teks = ''
                    if (similarity < 0.92) {
                    	teks = '*Eu tenho pouca fé nisso* :\n\n'
                    }
                    teks += `➸ *Título Japonês* : ${title}\n➸ *Título Chinês* : ${title_chinese}\n➸ *Títulos Romaji* : ${title_romaji}\n➸ *Título Inglês* : ${title_english}\n`
                    teks += `➸ *R-18?* : ${is_adult}\n`
                    teks += `➸ *Eps* : ${episode.toString()}\n`
                    teks += `➸ *Semelhança* : ${(similarity * 100).toFixed(1)}%\n`
                    var video = `https://media.trace.moe/video/${anilist_id}/${encodeURIComponent(filename)}?t=${at}&token=${tokenthumb}`;
                    client.sendFileFromUrl(from, video, 'anime.mp4', teks, id).catch(() => {
                        client.reply(from, teks, id)
                    })
                })
                .catch(() => {
                    client.reply(from, 'Algo deu errado!', id)
                })
            } else {
				client.reply(from, `Desculpe pelo formato errado \ n \ nPor favor, envie uma foto com a legenda ${prefix} whatanime \ n \ nOu responda a foto com a legenda ${prefix} whatanime`, id)
			}
            break
            case 'images': 
                if (args.length == 0) return client.reply(from, `Para pesquisar imagens do pinterest \n digite: #images [search] \n exemplo: #images naruto`, id)
                const cariwall = body.slice(8)
                const hasilwall = await images.fdci(cariwall)
                await client.sendFileFromUrl(from, hasilwall, '', '', id)
                .catch(() => {
                    client.reply(from, 'Erro em algo!', id)
                })
                break
            case 'igstalk':        
                    igStalk(value)
                        .then(data => {
                            const { Username, Jumlah_Followers, Jumlah_Following, Name, Jumlah_Post } = data
                            client.sendText(from, '[Aguarde] Stalkeando...')
                            let hasil = `✨Bio do Instagram _${value}_ \n\n 🧶 *Nome do usuário* : ${Username}_ \n 🌀 *Nome* : _${Name}_ \n 🌟 *Número de Seguidores* : _${Jumlah_Followers}_ \n 🌠 *Segue* : _${Jumlah_Following}_ \n ⭄*Total de posts* : _${Jumlah_Post}_ `, id
                            client.sendText(from, hasil)
                        })
                        .catch(err => {
                            client.sendText(from, err, id)
                        })
                    break
            case 'wiki':
            const value = body.split(' ').splice(1).join(' ')     
            wiki(value)
                    .then(data => {
                        const { hasil: res } = data
                        let hasil = `📝De acordo com Wikipedia:\n\n${res}`
                        client.sendText(from, hasil, id)
                 })
             .catch(err => {
            console.log(err)
          })
            break
        // Group Commands (group admin only)
        case 'add':
            const orang = args[1]
            if (!isGroupMsg) return client.reply(from, 'Este recurso só pode ser usado em grupos', id)
            if (args.length === 1) return client.reply(from, 'Para usar este recurso, envie o comando *#Add * 628xxxxx', id)
            if (!isGroupAdmins) return client.reply(from, 'Este comando só pode ser usado por administradores de grupo', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Este comando só pode ser usado quando o bot se torna administrador', id)
            try {
                await client.addParticipant(from, `${mentionedJidList[0].replace('@c.us', '')}`, id)
            } catch {
                client.reply(from, mess.error.Ad, id)
            }
            break
        case 'kick':
            if (!isGroupMsg) return client.reply(from, 'Desculpe, este comando só pode ser usado dentro de grupos! [Grupo apenas]', id)
            if (!isGroupAdmins) return client.reply(from, 'Falha, este comando só pode ser usado por administradores de grupo! [Grupo de administração apenas]', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Falha, adicione o bot como administrador do grupo! [Bot não é administrador]', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'Desculpe, o formato da mensagem está errado, por favor verifique o menu. [Formato incorreto]', id)
            if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Desculpe, o formato da mensagem está errado, por favor verifique o menu. [Formato incorreto]', id)
            await client.sendTextWithMentions(from, `Pedido aceito, expulso:\n${mentionedJidList.map(x => `@${x.replace('@c.us', '')}`).join('\n')}`)
            for (let i = 0; i < mentionedJidList.length; i++) {
                if (groupAdmins.includes(mentionedJidList[i])) return await client.sendText(from, 'Falha, você não pode remover o administrador do grupo.')
                await client.removeParticipant(groupId, mentionedJidList[i])
            }
            break
        case 'promote':
            if (!isGroupMsg) return await client.reply(from, 'Desculpe, este comando só pode ser usado dentro de grupos! [Grupo apenas]', id)
            if (!isGroupAdmins) return await client.reply(from, 'Falha, este comando só pode ser usado por administradores de grupo! [Grupo de administração apenas]', id)
            if (!isBotGroupAdmins) return await client.reply(from, 'Falha, adicione o bot como administrador do grupo! [Bot não é administrador]', id)
            if (mentionedJidList.length != 1) return client.reply(from, 'Desculpe, o formato da mensagem está errado, por favor verifique o menu. [Formato errado, apenas 1 usuário]', id)
            if (groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'Desculpe, o usuário já é um administrador. [Bot é Admin]', id)
            if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Desculpe, o formato da mensagem está errado, por favor verifique o menu. [Formato incorreto]', id)
            await client.promoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Pedido aceito, promovido @${mentionedJidList[0].replace('@c.us', '')} como admin.`)
            break
        case 'demote':
            if (!isGroupMsg) return client.reply(from, 'Desculpe, este comando só pode ser usado dentro de grupos! [Grupo apenas]', id)
            if (!isGroupAdmins) return client.reply(from, 'Falha, este comando só pode ser usado por administradores de grupo! [Grupo de administração apenas]', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Falha, adicione o bot como administrador do grupo! [Bot não é administrador]', id)
            if (mentionedJidList.length !== 1) return client.reply(from, 'Desculpe, o formato da mensagem está errado, por favor verifique o menu. [Formato errado, apenas 1 usuário]', id)
            if (!groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'Desculpe, o usuário não é um administrador. [usuário não administrador]', id)
            if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Desculpe, o formato da mensagem está errado, por favor verifique o menu. [Formato incorreto]', id)
            await client.demoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Pedido aceito, rebaixado @${mentionedJidList[0].replace('@c.us', '')}.`)
            break
        case 'bye':
            if (!isGroupMsg) return client.reply(from, 'Desculpe, este comando só pode ser usado dentro de grupos! [Grupo apenas]', id)
            if (!isGroupAdmins) return client.reply(from, 'Falha, este comando só pode ser usado por administradores de grupo! [Grupo de administração apenas]', id)
            client.sendText(from, 'Adeus... ( ⇀‸↼‶ )').then(() => client.leaveGroup(groupId))
            break
        case 'del':
            if (!isGroupAdmins) return client.reply(from, 'Falha, este comando só pode ser usado por administradores de grupo! [Grupo de administração apenas]', id)
            if (!quotedMsg) return client.reply(from, 'Desculpe, o formato da mensagem está errado, por favor verifique o menu. [Formato incorreto]', id)
            if (!quotedMsgObj.fromMe) return client.reply(from, 'Desculpe, o formato da mensagem está errado, por favor verifique o menu. [Formato incorreto]', id)
            client.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
            break
        	case 'mutegrup':
			if (!isGroupMsg) return client.reply(from, 'Desculpe, este comando só pode ser usado dentro de grupos!', id)
            if (!isGroupAdmins) return client.reply(from, 'Falha, este comando só pode ser usado por administradores de grupo!', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Falha, adicione o bot como administrador do grupo!', id)
			if (args.length !== 1) return client.reply(from, `Para alterar as configurações de bate-papo em grupo para que apenas administradores possam bater papo. \n \n Uso: \n ${prefix}mutegrup on - habilitar\n${prefix}mutegrup off - desligue`, id)
            if (args[0] == 'on') {
				client.setGroupToAdminsOnly(groupId, true).then(() => client.sendText(from, 'Alterado com sucesso para que apenas o administrador possa conversar!'))
			} else if (args[0] == 'off') {
				client.setGroupToAdminsOnly(groupId, false).then(() => client.sendText(from, 'Alterado com sucesso para que todos os membros possam conversar!'))
			} else {
				client.reply(from, `Para alterar as configurações do chat em grupo para que apenas o administrador possa bater papo\n\nUsar:\n${prefix}mutegrup on - ativar\n${prefix}mutegrup off - desligue`, id)
			}
			break
        case 'tagall':
        case 'todos':
        case 'todes':
            /**
            * This is Premium feature.
            * Check premium feature at https://trakteer.id/red-emperor/showcase or chat Author for Information.
            */
           if (!isGroupMsg) return client.reply(from, 'Desculpe, este comando só pode ser usado dentro de grupos! [Grupo apenas]', id)
             if (!isGroupAdmins) return client.reply(from, 'Falha, este comando só pode ser usado por administradores de grupo! [Grupo de administração apenas]', id)
              const mentions = mentionList(sender.id, botNumber, groupMembers)
               await client.sendTextWithMentions(from, `${pushname} CHAMANDO TODES!!!!!!\n${mentions}`)
            break
        case 'botstat': {
            const loadedMsg = await client.getAmountOfLoadedMessages()
            const chatIds = await client.getAllChatIds()
            const groups = await client.getAllGroups()
            client.sendText(from, `Status :\n- *${loadedMsg}* Mensagens carregadas\n- *${groups.length}* Bate-papos em grupo\n- *${chatIds.length - groups.length}* Bate-papos pessoais\n- *${chatIds.length}* Total Chats`)
            break
        }
        default:
            console.log(color('[ERROR]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Comando não registrado de', color(pushname))
            break
        }
    } catch (err) {
        console.error(color(err, 'red'))
    }

}

