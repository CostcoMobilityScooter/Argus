const { EmbedBuilder } = require('discord.js');
const { getLogChannel } = require('../levels/database');

/**
 * Sends a log embed to the configured log channel.
 */
async function sendLog(guild, { color, title, fields, thumbnail, footer }) {
  const channelId = getLogChannel(guild.id);
  if (!channelId) return;

  const channel = guild.channels.cache.get(channelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(color ?? 0x5865f2)
    .setTitle(title)
    .setTimestamp();

  if (fields?.length)  embed.addFields(fields);
  if (thumbnail)       embed.setThumbnail(thumbnail);
  if (footer)          embed.setFooter({ text: footer });

  await channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { sendLog };