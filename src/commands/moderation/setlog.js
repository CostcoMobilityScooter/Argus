const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { setLogChannel } = require('../../levels/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('Set the logging channel for server events')
    .addChannelOption(o =>
      o.setName('channel')
        .setDescription('Channel to send logs to')
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

    setLogChannel(interaction.guild.id, channel.id);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('✅ Log Channel Set')
      .setDescription(`Server events will now be logged to ${channel}.`)
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};