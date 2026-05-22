const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Check bot latency'),
  category: 'General', cooldown: 5,
  async execute(interaction, client) {
    const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });
    const embed = new EmbedBuilder().setColor(0x57f287).setTitle('🏓 Pong!')
      .addFields(
        { name: 'Roundtrip', value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`, inline: true },
        { name: 'WebSocket', value: `${client.ws.ping}ms`, inline: true },
      ).setTimestamp();
    interaction.editReply({ content: null, embeds: [embed] });
  },
};
