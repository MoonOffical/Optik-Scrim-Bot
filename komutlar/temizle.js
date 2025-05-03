const Discord = require('discord.js')
const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js")
const { google } = require('googleapis');
const { SCOP, SERVİCES_FİLES, SAMPLE_ID } = require('../config/ayarlar')
const db = require("croxydb")

const auth = new google.auth.GoogleAuth({
    keyFile: SERVİCES_FİLES,
    scopes: SCOP,
});

exports.run = async (client, message, args) => {
    let botkullanım = db.get(`${message.guild.id}_botkullanım`)
    if (message.member.roles.cache.find(r => r.id === botkullanım)) {
        const success = await clearSpreadsheetData();
        if (success) {
            message.channel.send('E tablodaki veriler başarıyla silindi!.');
        } else {
            message.channel.send('E tablodaki verileri temizlerken bir hata oluştu!');
        }
    }
}

exports.conf = {
    aliases: [],
    kategori: "ResultSlot"
};

exports.help = {
    name: 'temizle',
    description: 'E tablodaki veriyi temizler.',
};




async function clearSpreadsheetData() {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const clearDataRequest = {
        spreadsheetId: SAMPLE_ID,
        requestBody: {
            requests: [{
                updateCells: {
                    range: {
                        sheetId: 0,
                        startRowIndex: 2,
                        endRowIndex: 30,
                        startColumnIndex: 1,
                        endColumnIndex: 14
                    },
                    fields: 'userEnteredValue'
                }
            }]
        }
    };

    try {
        const response = await sheets.spreadsheets.batchUpdate(clearDataRequest);
        return response.status === 200;
    } catch (error) {
        console.error('Veri temizleme hatası:', error);
        return false;
    }
}