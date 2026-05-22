const { EmbedBuilder } = require('discord.js');
const config = require('./config');

async function logAction(guild, { type, user, reason, action, extra = '' }) {
  const channel = guild.channels.cache.find(c => c.name === config.logChannelName);
  if (!channel) return;
  const embed = new EmbedBuilder().setColor(0xeb459e).setTitle(`🛡 Automod — ${type}`)
    .addFields({ name: 'User', value: `${user.tag} (${user.id})`, inline: true }, { name: 'Action', value: action, inline: true }, { name: 'Reason', value: reason })
    .setTimestamp();
  if (extra) embed.addFields({ name: 'Details', value: extra });
  try { await channel.send({ embeds: [embed] }); } catch { /* ignore */ }
}

module.exports = { logAction };
