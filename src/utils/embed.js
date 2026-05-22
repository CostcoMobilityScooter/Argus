const { EmbedBuilder } = require('discord.js');

const COLORS = { success: 0x57f287, error: 0xff4444, info: 0x5865f2, warn: 0xfee75c, mod: 0xeb459e };

function makeEmbed(type, title, description) {
  return new EmbedBuilder().setColor(COLORS[type] ?? COLORS.info).setTitle(title).setDescription(description).setTimestamp();
}

module.exports = { makeEmbed, COLORS };
