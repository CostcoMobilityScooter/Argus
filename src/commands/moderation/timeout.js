const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder().setName('timeout').setDescription('Timeout a member')
    .addUserOption(o => o.setName('user').setDescription('Member to timeout').setRequired(true))
    .addStringOption(o => o.setName('duration').setDescription('Duration').setRequired(true)
      .addChoices(
        { name: '60 seconds', value: '60s' }, { name: '5 minutes', value: '5m' },
        { name: '10 minutes', value: '10m' }, { name: '1 hour', value: '1h' },
        { name: '6 hours', value: '6h' }, { name: '12 hours', value: '12h' },
        { name: '1 day', value: '1d' }, { name: '1 week', value: '7d' },
      ))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  category: 'Moderation', userPermissions: ['ModerateMembers'], cooldown: 5,
  async execute(interaction) {
    const target   = interaction.options.getMember('user');
    const duration = interaction.options.getString('duration');
    const reason   = interaction.options.getString('reason') ?? 'No reason provided';
    if (!target) return interaction.reply({ content: '❓ User not found.', ephemeral: true });
    if (!target.moderatable) return interaction.reply({ content: '🔒 I cannot timeout this user.', ephemeral: true });
    await target.timeout(ms(duration), `${interaction.user.tag}: ${reason}`);
    const embed = new EmbedBuilder().setColor(0xeb459e).setTitle('⏱ Member Timed Out')
      .addFields({ name: 'User', value: target.user.tag, inline: true }, { name: 'Duration', value: duration, inline: true }, { name: 'Mod', value: interaction.user.tag, inline: true }, { name: 'Reason', value: reason })
      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  },
};
