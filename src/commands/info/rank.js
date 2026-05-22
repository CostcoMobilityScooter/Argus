const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, getLeaderboard, xpForNextLevel } = require('../../levels/database');

module.exports = {
  data: new SlashCommandBuilder().setName('rank').setDescription('Check your rank and XP')
    .addUserOption(o => o.setName('user').setDescription('User to check').setRequired(false)),
  category: 'Info', cooldown: 5,
  async execute(interaction) {
    const target  = interaction.options.getUser('user') ?? interaction.user;
    const guildId = interaction.guild.id;
    const user    = getUser(target.id, guildId);
    const xpNeeded = xpForNextLevel(user.level);
    const leaderboard = getLeaderboard(guildId, 1000);
    const rank = leaderboard.findIndex(u => u.user_id === target.id) + 1;
    const barLength = 20;
    const filled = Math.round((user.xp / xpNeeded) * barLength);
    const progressBar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(`${target.username}'s Rank`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🏆 Rank',     value: rank > 0 ? `#${rank}` : 'Unranked', inline: true },
        { name: '⭐ Level',    value: `${user.level}`,                     inline: true },
        { name: '💬 Messages', value: `${user.messages}`,                  inline: true },
        { name: `📊 XP Progress — ${user.xp} / ${xpNeeded}`, value: `\`${progressBar}\` ${Math.round((user.xp / xpNeeded) * 100)}%` },
      ).setTimestamp();
    interaction.reply({ embeds: [embed] });
  },
};
