const Discord = require('discord.js');
const fs = require('fs');
const db = require('croxydb')
const { google } = require('googleapis');
const { SAMPLE_ID, SERVİCES_FİLES, SCOP } = require('../config/ayarlar')
const { sX, sY } = require('../config/koordinat')
const { slote, slot, font } = require('../config/tasarım')
const { createCanvas, loadImage, registerFont } = require('canvas')
const SCOPES = SCOP;
const SERVICE_ACCOUNT_FILE = SERVİCES_FİLES;
const SPREADSHEET_ID = SAMPLE_ID;

const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: SCOPES,
});

exports.run = async (client, message, args) => {
    let botkullanım = db.get(`${message.guild.id}_botkullanım`)
    if (message.channel.id === db.get(`${message.guild.id}_komutkullanımkanal`)) {
        if (message.member.roles.cache.has(botkullanım)) {
            var data = await Data()
            const canvas = createCanvas(1920, 1080)
            const ctx = canvas.getContext('2d')

            loadImage(slot).then(async (image) => {
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
                registerFont(font, { family: 'Impact' })
                ctx.fillStyle = '#ffffff';
                ctx.font = '30px Impact';

                for (let i = 0; i < data.length; i++) {
                    if (data[i] && data[i][0]) {
                        let takımlar = turkkelimeler(data[i][0])

                        try {
                            const logoPath = `./logolar/${takımlar}.png`;
                            if (fs.existsSync(logoPath)) {
                                try {
                                    const logo = await loadImage(logoPath);
                                    const logoWidth = 80;
                                    const logoHeight = 80;
                                    const logoX = sX[i] - 65;
                                    const logoY = sY[i] - (90 / 2);

                                    ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
                                } catch (logoError) {
                                    console.error(`Logo hatası (${takımlar}):`, logoError);
                                }
                            }

                            ctx.fillText(takımlar, sX[i], sY[i]);

                        } catch (error) {
                            console.error(`Hata (${takımlar}):`, error);
                            continue;
                        }
                    }
                }

                const attachment = new Discord.AttachmentBuilder(canvas.toBuffer(), { name: 'slot.png' });
                await message.reply({ files: [attachment] });
            })
        } else {
            let botk = message.guild.roles.cache.get(botkullanım)
            return message.reply({ content: `Bu komutu kullanabilmek için \`${botk.name}\` rolüne ihtiyacın var.` })
        }
    }
}

exports.conf = {
    aliases: [],
    kategori: "ResultSlot"
};

exports.help = {
    name: 'slot',
    description: 'Slot hakkında bilgi verir.',
};

async function Data() {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: slote,
        });
        return response.data.values || [];
    } catch (error) {
        return [];
    }
}

function turkkelimeler(team) {
    if (!team) return '';
    const turkkelimeler = {
        'ı': 'i',
        'İ': 'I',
        'ş': 's',
        'Ş': 'S',
        'ğ': 'g',
        'Ğ': 'G',
        'ü': 'u',
        'Ü': 'U',
        'ö': 'o',
        'Ö': 'O',
        'ç': 'c',
        'Ç': 'C',
    };
    return team.replace(/[ıİşŞğĞüÜöÖçÇ]/g, function (match) {
        return turkkelimeler[match];
    });
}
