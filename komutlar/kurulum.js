const Discord = require('discord.js');
const db = require('croxydb')
const { google } = require('googleapis');
const Embed = require('../functions/Embed');
const { prefix, sahip } = require('../config/ayarlar');

exports.run = async (client, message, args) => {
    if (message.author.id === sahip) {
        message.channel.send({ content: `Kurulum yapılıyor...` }).then(async (e) => {
            let yetkilirol = await message.guild.roles.create({
                name: `Bot Kullanım`,
                color: "Blurple",
                reason: "Code World Scrim Bot"
            })
            let a = await message.guild.channels.create({
                name: `Code World Scrim Bot`,
                type: Discord.ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone.id,
                        deny: [Discord.PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: yetkilirol.id,
                        allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.AttachFiles]
                    }
                ]
            });

            let b = await message.guild.channels.create({
                parent: a.id,
                name: `slot-oluştur`,
                type: Discord.ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone.id,
                        deny: [Discord.PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: yetkilirol.id,
                        allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages]
                    }
                ]
            }).then(async (e) => {
                await e.send({ embeds: [await Embed(client.user.username, message.guild.iconURL(), "Optik Hesaplama Kanalı", `Bu kanalı kullanmadan önce bilmen gerekenler:\n- Bu kanala attığınız slotları E-Tablo'ya işler.`, message.guild.iconURL(), `Code World Optik Bot`, message.guild.iconURL())] })
                db.set(`${message.guild.id}_slotkanalid`, e.id)
            })

            let f = await message.guild.channels.create({
                parent: a.id,
                name: `logo-yükle`,
                type: Discord.ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone.id,
                        deny: [Discord.PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: yetkilirol.id,
                        allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.AttachFiles]
                    }
                ]
            }).then(async (e) => {
                await e.send({ embeds: [await Embed(client.user.username, message.guild.iconURL(), "Optik Hesaplama Kanalı", `Bu kanalı kullanmadan önce bilmen gerekenler:\n- Bu kanalda PNG olarak attığınız resimler bota kaydedilir.`, message.guild.iconURL(), `Code World Optik Bot`, message.guild.iconURL())] })
                db.set(`${message.guild.id}_logoyükle`, e.id)
            })

            let c = await message.guild.channels.create({
                parent: a.id,
                name: `komut-kullanım`,
                type: Discord.ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone.id,
                        deny: [Discord.PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: yetkilirol.id,
                        allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages]
                    }
                ]
            }).then(async (e) => {
                await e.send({ embeds: [await Embed(client.user.username, message.guild.iconURL(), "Komut Kullanım Kanalı", `Bu kanalı kullanmadan önce bilmen gerekenler:\n- Bu kanalda botun genel komutlarını kullanabilirsin.\n- Ön Ek (Prefix): **${prefix}**`, message.guild.iconURL(), `Code World Optik Bot`, message.guild.iconURL())] })
                db.set(`${message.guild.id}_komutkullanımkanal`, e.id)
            })
            let d = await message.guild.channels.create({
                parent: a.id,
                name: `optik-hesaplama`,
                type: Discord.ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone.id,
                        deny: [Discord.PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: yetkilirol.id,
                        allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.AttachFiles]
                    }
                ]
            }).then(async (e) => {
                await e.send({ embeds: [await Embed(client.user.username, message.guild.iconURL(), "Optik Hesaplama Kanalı", `Bu kanalı kullanmadan önce bilmen gerekenler:\n- Bu kanalda **maç sonu screanshot(ss)**'lerini atarak E-Tablo'ya otomatik **sıralama** ve **kill** puanlarını işleyebilirsiniz.`, message.guild.iconURL(), `Code World Optik Bot`, message.guild.iconURL())] })
                db.set(`${message.guild.id}_optikkanal`, e.id)
            })
            db.set(`${message.guild.id}_botkullanım`, yetkilirol.id)
            e.edit({ content: `Kurulum tamamlandı!` })
        })
    }
}

exports.conf = {
    aliases: [],
    kategori: "ResultSlot"
};

exports.help = {
    name: 'kurulum',
    description: 'Sistemi kurar.',
};
