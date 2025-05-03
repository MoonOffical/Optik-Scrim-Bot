const Discord = require('discord.js');
const fs = require('fs');
const db = require('croxydb')
const { google } = require('googleapis');
const { SAMPLE_ID, SERVİCES_FİLES, SCOP, puansistemi } = require('../config/ayarlar')
const { rX, rY, winCountY } = require('../config/koordinat')
const { resulte, result, font } = require('../config/tasarım')
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
            var canvas = createCanvas(1920, 1080);
            var ctx = canvas.getContext('2d');

            let data = await eventHandler();
            registerFont(font, { family: 'Impact' })
            ctx.fillStyle = '#ffffff';
            ctx.font = '30px Impact';

            loadImage(result).then(async (image) => {
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                var x = Data()
                if (data && data.length > 0) {
                    var teams = {};
                    const puanlar = [0]
                    for (let i = 0; i < 20; i++) {
                        puanlar.push(puansistemi[i])
                    }
                    for (let i = 0; i < data.length; i++) {
                        var teamName = turkkelimeler(data[i][0]) || "";
                        if (!teams[teamName]) {
                            teams[teamName] = { totalPuan: 0, totalKill: 0, totalSira: 0, winCount: 0 };
                        }

                        for (let j = 0; j < 5; j++) {
                            let kill = parseInt(data[i][3 + (j * 2)]) || 0;
                            let sira = parseInt(data[i][4 + (j * 2)]) || 0;

                            if (!isNaN(kill) && !isNaN(sira)) {
                                let totalPuan = 0;
                                if (sira == 1) { totalPuan = puansistemi[1]; sira = 10; teams[teamName].winCount++; }
                                else if (sira == 2) { totalPuan = puansistemi[2]; sira = 6 }
                                else if (sira == 3) { totalPuan = puansistemi[3]; sira = 5 }
                                else if (sira == 4) { totalPuan = puansistemi[4]; sira = 4 }
                                else if (sira == 5) { totalPuan = puansistemi[5]; sira = 3 }
                                else if (sira == puansistemi[6]) { totalPuan = 4; sira = 2 }
                                else if (sira == puansistemi[7]) { totalPuan = 2; sira = 1 }
                                else { totalPuan = 0; sira = 0 }

                                teams[teamName].totalPuan += parseInt(kill) + parseInt(sira)
                                teams[teamName].totalKill += sira;
                                teams[teamName].totalSira += kill;
                            }
                        }
                    }
                    var ST = Object.entries(teams).sort((a, b) => b[1].totalPuan - a[1].totalPuan);

                    ctx.textAlign = 'left';
                    var spaceOfNameKill = 400
                    var spaceOfSiraTotal = 92
                    var spaceOfKillSira = 92

                    for (let index = 0; index < ST.length; index++) {
                        const [teamName, teamData] = ST[index];

                        if (teamName.trim() !== "") {
                            var teamNameX = rX[index]
                            var initialY = rY[index]

                            try {
                                const logoPath = `./logolar/${teamName}.png`;

                                if (fs.existsSync(logoPath)) {
                                    try {
                                        const logo = await loadImage(logoPath);
                                        const logoWidth = 80;
                                        const logoHeight = 80;
                                        const logoX = teamNameX - 65;
                                        const logoY = initialY - (90 / 2);

                                        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
                                    } catch (logoError) {
                                        console.error(`Logo hatası (${teamName}):`, logoError);
                                    }
                                }

                                ctx.fillText(teamName, teamNameX, initialY);
                                ctx.fillText(teamData.totalSira, teamNameX + spaceOfNameKill, initialY);
                                ctx.fillText(teamData.totalKill, teamNameX + spaceOfNameKill + spaceOfKillSira, initialY);
                                ctx.fillText(teamData.totalPuan, teamNameX + spaceOfNameKill + spaceOfKillSira + spaceOfSiraTotal, initialY);

                                if (teamData.winCount >= 1) {
                                    ctx.fillText(`X${teamData.winCount}`, teamNameX + winCountY, initialY)
                                }

                            } catch (error) {
                                console.log(error)
                                continue;
                            }
                        }
                    }

                    const attachment = new Discord.AttachmentBuilder(canvas.toBuffer(), 'result.png');
                    message.channel.send({ files: [attachment] })
                }
            })
        } else {
            let botk = message.guild.roles.cache.get(botkullanım)
            return message.channel.send({ content: `Bu komutu kullanabilmek için \`${botk.name}\` rolüne ihtiyacın var.` })
        }
    }
}

exports.conf = {
    aliases: [""],
    kategori: "ResultSlot"
};

exports.help = {
    name: 'result',
    description: 'Result listesini çıkartır.',
};


async function Data() {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    try {
        const response = sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: resulte,
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


async function eventHandler() {
    try {
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        const promises = resulte.map(range => sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: resulte,
        }));

        const responses = await Promise.all(promises);

        const allData = responses.reduce((acc, response) => {
            const data = response.data.values || [];
            return acc.concat(data);
        }, []);

        return allData;
    } catch (error) {
        console.error('Data retrieval failed:', error);
        throw error;
    }
}

