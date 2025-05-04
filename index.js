const { Client, GatewayIntentBits, Partials, ButtonBuilder, ButtonComponent, ButtonStyle, ActionRowBuilder, PermissionsFlags, ModalBuilder, TextInputBuilder, TextInputStyle, Collection, AttachmentBuilder } = require("discord.js");
const fs = require("fs")
const db = require("croxydb")
const Discord = require("discord.js")
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { google } = require('googleapis');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { SAMPLE_ID, SERVİCES_FİLES, SCOP, GEMINI_API_KEY, botdurumyazı, prefix, token, sunucuid } = require('./config/ayarlar.js');;
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.User,
        Partials.ThreadMember,
    ],
});

module.exports = client;

const { EmbedBuilder } = require("@discordjs/builders");
const { error } = require("console");
const Embed = require("./functions/Embed.js");

client.login(token)


client.on("messageCreate", async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    let command = message.content.toLocaleLowerCase().split(" ")[0].slice(prefix.length);
    let params = message.content.split(" ").slice(1);
    let cmd;
    if (client.commands.has(command)) {
        cmd = client.commands.get(command);
    } else if (client.aliases.has(command)) {
        cmd = client.commands.get(client.aliases.get(command));
    }
    if (cmd) {
        if (message.guild.id === sunucuid) {
            cmd.run(client, message, params);
        } else {
            return;
        }
    }

});

client.commands = new Collection();
client.aliases = new Collection();

client.on('ready', () => {

    client.user.setPresence({ activities: [{ name: `${botdurumyazı || "Code World"}` }] });

    console.log('_________________________________________');
    console.log(`Bot Adı     : ${client.user.username}`);
    console.log(`Prefix      : ${prefix}`);
    console.log(`Durum       : Bot Çevrimiçi!`);
    console.log('_________________________________________');
});

fs.readdir("./komutlar", (err, files) => {
    if (err) console.error(err);
    files.forEach(f => {
        let props = require(`./komutlar/${f}`);
        client.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });

})

const SCOPES = SCOP;
const SERVICE_ACCOUNT_FILE = SERVİCES_FİLES;

const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: SCOPES,
});
const sheets = google.sheets({ version: 'v4', auth });

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;

    if (message.channel.id === db.get(`${message.guild.id}_slotkanalid`)) {
        const teams = message.content.split('\n')
            .map(line => {
                const [teamName, tag] = line.trim().split(/\s*\|\s*/)
                    .map(item => item?.toUpperCase().trim() || "")
                    .filter(item => item !== "");

                return { teamName: teamName || "Bilinmeyen Takım", tag: tag || "TAG_YOK" };
            })
            .filter(t => t.teamName !== "Bilinmeyen Takım");

        if (teams.length < 1 || teams.length > 25) {
            await message.react('❌');
            await message.reply({ embeds: [await Embed(message.author.username, message.author.avatarURL(), "İşlem Başarısız", `En az **1**, en fazla **25** takım yazabilirsin.\nSenin yazdığın takım sayısı: **${teams.length}**`, null, message.guild.name, message.guild.iconURL(), "Red")] })
            return;
        }

        try {
            await sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: SAMPLE_ID,
                resource: {
                    data: [
                        {
                            range: `Scrim!B3:B${2 + teams.length}`,
                            values: teams.map(t => [t.teamName])
                        },
                        {
                            range: `Scrim!D3:D${2 + teams.length}`,
                            values: teams.map(t => [t.tag])
                        }
                    ],
                    valueInputOption: 'RAW'
                }
            });

            await message.react('✅');
            await message.reply({ embeds: [await Embed(message.author.username, message.guild.iconURL(), "Slotlar Girildi", `İşlem başarıyla tamamlandı.\nSlotlar **E-Tabloya** işlendi.`, null, message.guild.name, message.guild.iconURL(), null)] })
        } catch (error) {
            await message.react('❌')
            await message.reply({ embeds: [await Embed(message.author.username, message.guild.iconURL(), "İşlem Başarısız", `E Tabloya aktarma işlemi başarısız oldu.`, null, message.guild.name, message.guild.iconURL(), "Red")] })
            console.log(error)
        }
        return;
    }


    if (message.channel.id === db.get(`${message.guild.id}_optikkanal`)) {
        const matchNumber = parseInt(message.content.split('\n')[0].trim());
        if (isNaN(matchNumber) || matchNumber < 1) {
            await message.react('❌');
            return message.reply("Geçersiz maç numarası!");
        }

        const attachments = [...message.attachments.values()].filter(a => ['image/png', 'image/jpeg'].includes(a.contentType));
        if (attachments.length === 0) return;

        try {
            const processedPlayers = new Set();
            let allPlayers = [];
            const strictRegex = /\* ([^\→]+) → Kill: (\d{1,2}) → Sıra: (\d{1,2})/gi;

            for (const attachment of attachments) {
                const imageBuffer = Buffer.from(await (await fetch(attachment.url)).arrayBuffer());
                const result = await model.generateContent([
                    "Resimdeki oyuncu bilgilerini TAM ŞU FORMATTA ver:\n" +
                    "* OyuncuAdı → Kill: X → Sıra: Y\n" +
                    "ÖRNEK: * KTXPlayer1 → Kill: 5 → Sıra: 1\n" +
                    "FORMAT DIŞINDA HIÇBIR ŞEY YAZMA!",
                    { inlineData: { data: imageBuffer.toString("base64"), mimeType: attachment.contentType } }
                ]);

                const text = (await result.response).text();

                const players = [...text.matchAll(strictRegex)]
                    .map(m => {
                        const name = m[1].trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
                        const kill = parseInt(m[2]);
                        const rank = parseInt(m[3]);

                        if (isNaN(kill) || isNaN(rank)) return null;
                        if (processedPlayers.has(name)) return null;

                        return { name, kill, rank };
                    })
                    .filter(p => p !== null);

                players.forEach(p => processedPlayers.add(p.name));
                allPlayers = [...allPlayers, ...players];
            }

            const tagData = await sheets.spreadsheets.values.get({
                spreadsheetId: SAMPLE_ID,
                range: "Scrim!D3:D29"
            });

            const tags = (tagData.data.values || [])
                .flatMap(t => t[0]?.toUpperCase().replace(/[^A-Z0-9]/g, "") || "")
                .filter(t => t.length > 0);

            const teamStats = {};
            const teamsByRank = {};

            allPlayers.forEach(player => {
                if (!teamsByRank[player.rank]) {
                    teamsByRank[player.rank] = [];
                }
                teamsByRank[player.rank].push(player);
            });

            Object.entries(teamsByRank).forEach(([rank, teamPlayers]) => {
                const teamTotalKill = teamPlayers.reduce((sum, p) => sum + p.kill, 0);
                let teamLongestTag = null;
                let maxTagLength = 0;

                teamPlayers.forEach(player => {
                    tags.forEach(tag => {
                        if (player.name.includes(tag) && tag.length > maxTagLength) {
                            maxTagLength = tag.length;
                            teamLongestTag = tag;
                        }
                    });
                });

                if (!teamLongestTag) return;

                if (!teamStats[teamLongestTag]) {
                    teamStats[teamLongestTag] = {
                        totalKill: 0,
                        bestRank: Infinity
                    };
                }

                teamStats[teamLongestTag].totalKill += teamTotalKill;
                if (parseInt(rank) < teamStats[teamLongestTag].bestRank) {
                    teamStats[teamLongestTag].bestRank = parseInt(rank);
                }
            });

            const updateData = [];
            Object.entries(teamStats).forEach(([tag, stats]) => {
                const rowIndex = tags.indexOf(tag);
                if (rowIndex === -1) return;

                const killColumn = 5 + (matchNumber - 1) * 2;
                const rankColumn = killColumn + 1;

                if (killColumn > 26 || rankColumn > 27) {
                    console.error("Geçersiz sütun:", killColumn);
                    return;
                }

                updateData.push(
                    { range: `Scrim!${String.fromCharCode(64 + killColumn)}${rowIndex + 3}`, values: [[stats.totalKill]] },
                    { range: `Scrim!${String.fromCharCode(64 + rankColumn)}${rowIndex + 3}`, values: [[stats.bestRank === Infinity ? "" : stats.bestRank]] });
            });

            if (updateData.length > 0) {
                await sheets.spreadsheets.values.batchUpdate({
                    spreadsheetId: SAMPLE_ID,
                    resource: { data: updateData, valueInputOption: "USER_ENTERED" }
                });
                await message.react('✅');
                await message.reply({
                    embeds: [await Embed(message.author.username,
                        message.author.avatarURL(), "Aktarıldı", `İşlem başarıyla tamamlandı.\n**${updateData.length / 2} takım** verisi işlendi.`, null, message.guild.name, message.guild.iconURL(), "Blurple"
                    )]
                });
            } else {
                await message.react('❌');
                await message.reply({
                    embeds: [await Embed(message.author.username, message.author.avatarURL(), "Hata", "İşlenecek veri bulunamadı!", null, message.guild.name, message.guild.iconURL(), "Blurple"
                    )]
                });
            }
        } catch (error) {
            console.error("[KRİTİK HATA]", error);
            await message.react('❌');
            await message.reply({
                embeds: [await Embed(message.author.username, message.author.avatarURL(), "Sistem Hatası", `Hata kodu: \`${error.code || "Bilinmeyen"}\`\nDetaylar konsolda.`, null, message.guild.name, message.guild.iconURL(), "Red")]
            });
        }
    }

    if (message.channel.id === db.get(`${message.guild.id}_logoyükle`)) {
        const teamName = message.content;

        if (!teamName) {
            return message.reply({ embeds: [await Embed(message.author.username, message.author.avatarURL(), "İşlem Başarısız", `Takım ismi girmen gerek.`, null, message.guild.name, message.guild.iconURL(), "Red")] })
        }

        const attachment = message.attachments.first()
        if (!attachment) {
            return message.reply({ embeds: [await Embed(message.author.username, message.author.avatarURL(), "İşlem Başarısız", `Takımın png logosunu atmalısın.`, null, message.guild.name, message.guild.iconURL(), "Red")] })
        }
        const response = await fetch(attachment.url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        try {
            fs.writeFileSync(`./logolar/${message.content}.png`, buffer)
            await message.react('✅')
        } catch (err) {
            await message.react('❌')
            console.log("Hata!", err)
        }
    }
});
