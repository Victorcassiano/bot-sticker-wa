const wa = require('@open-wa/wa-automate');
const mime = require('mime-types');
const fs = require('fs');
const path = require('path')
const nodeSchedule = require('node-schedule');


const { jokers } = require('./mockJokers.json')

wa.create({
    sessionId: "COVID_HELPER",
    multiDevice: true, //required to enable multiDevice support
    authTimeout: 120, //wait only 60 seconds to get a connection with the host account device
    blockCrashLogs: true,
    autoRefresh: false,
    blockAssets: true,
    disableSpins: true,
    headless: true,
    hostNotificationLang: 'PT_BR',
    logConsole: false,
    popup: false,
    cacheEnabled: true,
    qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
}).then(client => start(client));

const prefix = '$';

function start(client) {
    //558499374018@c.us mamae
    //558481879013@c.us pp


    nodeSchedule.scheduleJob('0 12 * * *', async function () {
        const numberRadom = Math.floor(Math.random() * (jokers.length - 0 + 1) + 0);
        await client.sendText('558481879013@c.us', jokers[numberRadom])
    });

    client.onMessage(async message => {
        if (message.mimetype) {
            try {
                const [command, opt] = message.text.split(' - ')
                if (command.startsWith(prefix + 'cria essa porra')) {
                    if (!message.mimetype.startsWith('image')) {
                        await client.sendText(message.from, 'Arquivo inválido');
                        throw new Error('Invalid file')
                    }
                    console.log(message.sender)
                    console.log('>> pediu para criar uma figurinha')
                    console.log('>> ' + new Date().toISOString())

                    await client.sendText(message.from, 'Tô criando caralho, espera aí.');

                    const filename = `${message.t}.${mime.extension(message.mimetype)}`;
                    const mediaData = await wa.decryptMedia(message);

                    fs.writeFileSync(path.join(__dirname, 'temp', filename), mediaData)

                    const baseDir = path.join(__dirname, 'temp', filename)

                    const readImageTemp = fs.readFileSync(baseDir, { encoding: 'base64' })

                    await client.sendImageAsSticker(
                        message.from,
                        readImageTemp,
                        {
                            keepScale: true,
                            removebg: opt === 'remove' ? true : false,
                            author: "Bot amigo de todes",
                            pack: "bot-sticker"
                        },
                    )

                    console.log('>> figurinha criada e enviada')
                    console.log('>> ' + new Date().toISOString())

                }
            } catch (err) {
                console.log('>> Erro: ' + err)
                console.log('>> ' + new Date().toISOString())
            }
        }

        if (message.body.startsWith(prefix + 'comandos')) {
            await client.sendText(message.from, 'Comandos:');
            await client.sendText(message.from, '1 - $cria essa porra\n2 - $cria essa porra - remove (Remove o fundo :D)');
        }

    });
}