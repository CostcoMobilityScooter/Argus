const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('userinfo').setDescription('Display info about a user')
    .addUserOption(o => o.setName('user').setDescription('User to look up').setRequired(false)),
  category: 'Info', cooldown: 5,
  async execute(interaction) {
    const user   = interaction.options.getUser('user') ?? interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    const roles  = member?.roles.cache.filter(r => r.id !== interaction.guild.id).sort((a, b) => b.position - a.position).map(r => r.toString()).slice(0, 10).join(', ') || 'None';
    const embed  = new EmbedBuilder().setColor(member?.displayColor ?? 0x5865f2).setTitle(user.tag)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🆔 User ID', value: user.id, inline: true },
        { name: '🤖 Bot', value: user.bot ? 'Yes' : 'No', inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
      );
    if (member) {
      embed.addFields(
        { name: '📥 Joined', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`, inline: true },
        { name: '🎨 Display Name', value: member.displayName, inline: true },
        { name: `🎭 Roles [${member.roles.cache.size - 1}]`, value: roles },
      );
    }
    embed.setTimestamp();
    interaction.reply({ embeds: [embed] });
  },
};
