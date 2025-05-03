const { EmbedBuilder } = require("discord.js")

async function Embed(aname, aicon, title, desc, thumbnail, ftext, ficon, color) {

     const embed = new EmbedBuilder()
          .setTimestamp()

     if (aname) {
          embed.setAuthor({ name: `${aname}`, iconURL: aicon || null })
     }
     if (title) {
          embed.setTitle(`${title}`)
     }
     if (desc) {
          embed.setDescription(`${desc}`)
     }
     if (thumbnail) {
          embed.setThumbnail(thumbnail)
     }
     if (ftext) {
          embed.setFooter({ text: `${ftext}`, iconURL: ficon || null })
     }
     if (color) {
          embed.setColor(color)
     } else if (color === null) {
          embed.setColor("Blurple")
     } else if (color === undefined) {
          embed.setColor("Blurple")
     }
     return embed;
}

module.exports = Embed;