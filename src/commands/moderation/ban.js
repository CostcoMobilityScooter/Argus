const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isHigherRole } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder().setName('ban').setDescription('Ban a member')
    .addUserOption(o => o.setName('user').setDescription('Member to ban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false))
    .addIntegerOption(o => o.setName('days').setDescription('Days of messages to delete (0-7)').setMinValue(0).setMaxValue(7).setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  category: 'Moderation', userPermissions: ['BanMembers'], cooldown: 5,
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    const days   = interaction.options.getInteger('days') ?? 0;
    if (!target) return interaction.reply({ content: '❓ User not found.', ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ content: '🚫 You cannot ban yourself.', ephemeral: true });
    if (!target.bannable) return interaction.reply({ content: '🔒 I cannot ban this user.', ephemeral: true });
    if (!isHigherRole(interaction.member, target)) return interaction.reply({ content: '🔒 You cannot ban someone with an equal or higher role.', ephemeral: true });
    try { await target.user.send(`🔨 You have been **banned** from **${interaction.guild.name}**.\nReason: ${reason}`); } catch { /* DMs off */ }
    await target.ban({ deleteMessageDays: days, reason: `${interaction.user.tag}: ${reason}` });
    const embed = new EmbedBuilder().setColor(0xff4444).setTitle('🔨 Member Banned')
      .addFields({ name: 'User', value: `${target.user.tag} (${target.id})`, inline: true }, { name: 'Mod', value: interaction.user.tag, inline: true }, { name: 'Reason', value: reason })
      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  },
};
