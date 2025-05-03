const Discord = require('discord.js')
const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js")
const db = require('croxydb')
const { prefix } = require('../config/ayarlar')

exports.run = async (client, message, args) => {
  let botkullanım = db.get(`${message.guild.id}_botkullanım`)
  if (message.channel.id === db.get(`${message.guild.id}_komutkullanımkanal`)) {
    if (message.member.roles.cache.has(botkullanım)) {

      const komutlar = new Discord.EmbedBuilder()
        .setAuthor({ name: `${message.guild.name} Komutlar`, iconURL: message.guild.iconURL({ dynamic: true }) })
        .setDescription(client.commands.filter(cmd => cmd.conf.kategori === 'ResultSlot').map(cmd => `**${prefix}${cmd.help.name}** ${cmd.help.description}`).join("\n "))
        .setTimestamp()
        .setFooter({ text: `${message.author.tag} tarafından istendi.`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setThumbnail(message.guild.iconURL({ dynamic: true }))

      message.channel.send({ embeds: [komutlar] })
    } else {
      let botk = message.guild.roles.cache.get(botkullanım)
      return message.channel.send({ content: `Bu komutu kullanabilmek için \`${botk.name}\` rolüne ihtiyacın var.` })
    }
  }
}

exports.conf = {
  aliases: [],
};

exports.help = {
  name: 'yardım',
  description: 'Komutlar hakkında bilgi verir.',
};



