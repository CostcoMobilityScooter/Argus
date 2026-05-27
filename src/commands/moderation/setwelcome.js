const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { setWelcomeChannel } = require('../../levels/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('Set the welcome channel for new members')
    .addChannelOption(o =>
      o.setName('channel')
        .setDescription('Channel to send welcome messages to')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  category: 'Moderation',
  userPermissions: ['ManageGuild'],
  cooldown: 5,

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    if (channel.type !== 0) {
      return interaction.reply({ content: '❌ Please select a text channel.', ephemeral: true });
    }

    setWelcomeChannel(interaction.guild.id, channel.id);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('✅ Welcome Channel Set')
      .setDescription(`Welcome messages will now be sent to ${channel}.`)
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};