const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder().setName('remind').setDescription('Set a DM reminder')
    .addStringOption(o => o.setName('time').setDescription('Time e.g. 10m, 2h, 1d').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('What to remind you about').setRequired(true)),
  category: 'Utility', cooldown: 5,
  async execute(interaction) {
    const timeStr = interaction.options.getString('time');
    const message = interaction.options.getString('message');
    const delay   = ms(timeStr);
    if (!delay || delay <= 0 || delay > ms('30d')) return interaction.reply({ content: '❌ Invalid time. Use e.g. `10m`, `2h`, `1d` (max 30d).', ephemeral: true });
    await interaction.reply({ content: `⏰ Got it! I'll DM you in **${timeStr}**: "${message}"`, ephemeral: true });
    setTimeout(async () => {
      try {
        const embed = new EmbedBuilder().setColor(0x5865f2).setTitle('⏰ Reminder!').setDescription(message).setFooter({ text: `Set in ${interaction.guild?.name ?? 'DM'}` }).setTimestamp();
        await interaction.user.send({ embeds: [embed] });
      } catch { /* DMs off */ }
    }, delay);
  },
};
