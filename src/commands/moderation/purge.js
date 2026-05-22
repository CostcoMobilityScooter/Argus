const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('purge').setDescription('Bulk delete messages')
    .addIntegerOption(o => o.setName('amount').setDescription('Messages to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .addUserOption(o => o.setName('user').setDescription('Only delete from this user').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  category: 'Moderation', userPermissions: ['ManageMessages'], cooldown: 5,
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const user   = interaction.options.getUser('user');
    await interaction.deferReply({ ephemeral: true });
    let messages = await interaction.channel.messages.fetch({ limit: 100 });
    if (user) messages = messages.filter(m => m.author.id === user.id);
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    messages = messages.filter(m => m.createdTimestamp > twoWeeksAgo).first(amount);
    if (!messages.length) return interaction.editReply('❌ No eligible messages found.');
    const deleted = await interaction.channel.bulkDelete(messages, true);
    const embed = new EmbedBuilder().setColor(0x57f287).setTitle('🗑 Messages Purged')
      .setDescription(`Deleted **${deleted.size}** message(s)${user ? ` from ${user.tag}` : ''}.`).setTimestamp();
    interaction.editReply({ embeds: [embed] });
  },
};
