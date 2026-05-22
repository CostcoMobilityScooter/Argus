const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isHigherRole } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder().setName('kick').setDescription('Kick a member')
    .addUserOption(o => o.setName('user').setDescription('Member to kick').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  category: 'Moderation', userPermissions: ['KickMembers'], cooldown: 5,
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    if (!target) return interaction.reply({ content: '❓ User not found.', ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ content: '🚫 You cannot kick yourself.', ephemeral: true });
    if (!target.kickable) return interaction.reply({ content: '🔒 I cannot kick this user.', ephemeral: true });
    if (!isHigherRole(interaction.member, target)) return interaction.reply({ content: '🔒 You cannot kick someone with an equal or higher role.', ephemeral: true });
    try { await target.user.send(`👢 You have been **kicked** from **${interaction.guild.name}**.\nReason: ${reason}`); } catch { /* DMs off */ }
    await target.kick(`${interaction.user.tag}: ${reason}`);
    const embed = new EmbedBuilder().setColor(0xfee75c).setTitle('👢 Member Kicked')
      .addFields({ name: 'User', value: `${target.user.tag}`, inline: true }, { name: 'Mod', value: interaction.user.tag, inline: true }, { name: 'Reason', value: reason })
      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  },
};
