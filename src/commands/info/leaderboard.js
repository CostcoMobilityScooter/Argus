const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard, xpForNextLevel } = require('../../levels/database');

module.exports = {
  data: new SlashCommandBuilder().setName('leaderboard').setDescription('Show the top 10 most active members'),
  category: 'Info', cooldown: 10,
  async execute(interaction) {
    await interaction.deferReply();
    const top = getLeaderboard(interaction.guild.id, 10);
    if (!top.length) return interaction.editReply('❌ No one has earned any XP yet!');
    const medals = ['🥇', '🥈', '🥉'];
    const rows = await Promise.all(top.map(async (entry, i) => {
      const user = await interaction.client.users.fetch(entry.user_id).catch(() => null);
      const name = user ? user.username : 'Unknown User';
      return `${medals[i] ?? `**#${i + 1}**`} **${name}** — Level ${entry.level} • ${entry.xp}/${xpForNextLevel(entry.level)} XP`;
    }));
    const embed = new EmbedBuilder().setColor(0xfee75c).setTitle(`🏆 ${interaction.guild.name} Leaderboard`)
      .setDescription(rows.join('\n\n')).setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setFooter({ text: `Top ${top.length} members` }).setTimestamp();
    interaction.editReply({ embeds: [embed] });
  },
};
