const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('warn').setDescription('Warn a member')
    .addUserOption(o => o.setName('user').setDescription('Member to warn').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  category: 'Moderation', userPermissions: ['ModerateMembers'], cooldown: 5,
  async execute(interaction, client) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');
    if (!target) return interaction.reply({ content: '❓ User not found.', ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ content: '🚫 You cannot warn yourself.', ephemeral: true });
    const key = `${interaction.guild.id}-${target.id}`;
    const existing = client.warnings.get(key) ?? [];
    existing.push({ reason, mod: interaction.user.tag, at: new Date().toISOString() });
    client.warnings.set(key, existing);
    try { await target.user.send(`⚠️ You have been **warned** in **${interaction.guild.name}**.\nReason: ${reason}\nTotal warnings: **${existing.length}**`); } catch { /* DMs off */ }
    const embed = new EmbedBuilder().setColor(0xfee75c).setTitle('⚠️ Member Warned')
      .addFields({ name: 'User', value: target.user.tag, inline: true }, { name: 'Total Warnings', value: `${existing.length}`, inline: true }, { name: 'Mod', value: interaction.user.tag, inline: true }, { name: 'Reason', value: reason })
      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  },
};
