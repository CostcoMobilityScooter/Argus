const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('say').setDescription('Make Argus send a message')
    .addStringOption(o => o.setName('message').setDescription('Message to send').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('Channel (defaults to current)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  category: 'General', userPermissions: ['ManageMessages'], cooldown: 5,
  async execute(interaction) {
    const message = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;
    await channel.send(message);
    await interaction.reply({ content: `✅ Message sent to ${channel}`, ephemeral: true });
  },
};
