const Discord = require('discord.js');
const { google } = require('googleapis');
const db = require('croxydb')
const { SAMPLE_ID, SERVİCES_FİLES, SCOP } = require('../config/ayarlar')

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
            if (!args[0]) {
                return message.channel.send('Lütfen bir e-posta adresi girin.');
            }

            const email = args[0];

            try {
                const authClient = await auth.getClient();
                const drive = google.drive({ version: 'v3', auth: authClient });

                await drive.permissions.create({
                    fileId: SPREADSHEET_ID,
                    requestBody: {
                        role: 'writer',
                        type: 'user',
                        emailAddress: email
                    }
                });

                message.channel.send(`${email} başarıyla e tabloya eklendi.`);
            } catch (error) {
                console.error('Error adding editor:', error);
                message.channel.send('E-posta adresi eklenirken bir hata oluştu.');
            }
        } else {
            let botk = message.guild.roles.cache.get(botkullanım)
            return message.channel.send({ content: `Bu komutu kullanabilmek için \`${botk.name}\` rolüne ihtiyacın var.` })
        }
    }
}

exports.conf = {
    aliases: [],
    kategori: "ResultSlot"
};

exports.help = {
    name: 'hesapekle',
    description: 'E tabloya gmail ekler',
};
