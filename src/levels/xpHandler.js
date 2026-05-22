const { EmbedBuilder } = require('discord.js');
const { getUser, addXP, setLevel, xpForNextLevel } = require('./database');

const xpCooldown = new Map();

async function handleXP(message) {
  if (!message.guild || message.author.bot) return;

  const userId  = message.author.id;
  const guildId = message.guild.id;
  const key     = `${userId}-${guildId}`;

  if (xpCooldown.has(key)) return;
  xpCooldown.set(key, true);
  setTimeout(() => xpCooldown.delete(key), 60_000);

  const xpGained = Math.floor(Math.random() * 11) + 15;
  const before   = getUser(userId, guildId);
  addXP(userId, guildId, xpGained);
  const after    = getUser(userId, guildId);

  const xpNeeded = xpForNextLevel(before.level);
  if (after.xp < xpNeeded) return;

  const newLevel = before.level + 1;
  setLevel(userId, guildId, newLevel);

  const levelChannel = message.guild.channels.cache.find(
    c => c.name === '↪-levels' || c.name === 'level-up' || c.name === 'leveling' || c.name === 'general'
  );
  if (!levelChannel) return;

  const embed = new EmbedBuilder().setColor(0xfee75c).setTitle('⬆️ Level Up!')
    .setDescription(`${message.author} just reached **Level ${newLevel}**! 🎉`)
    .setThumbnail(message.author.displayAvatarURL({ dynamic: true })).setTimestamp();

  levelChannel.send({ embeds: [embed] });
}

module.exports = { handleXP };
