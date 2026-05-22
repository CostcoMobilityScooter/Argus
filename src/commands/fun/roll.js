const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('roll').setDescription('Roll dice (e.g. 2d6)')
    .addStringOption(o => o.setName('dice').setDescription('Dice notation e.g. 2d6').setRequired(false)),
  category: 'Fun', cooldown: 3,
  async execute(interaction) {
    const input = interaction.options.getString('dice') ?? '1d6';
    const match = input.match(/^(\d+)d(\d+)$/i);
    if (!match) return interaction.reply({ content: '❌ Use NdN format e.g. `2d6`', ephemeral: true });
    const count = Math.min(parseInt(match[1]), 20);
    const sides = Math.min(parseInt(match[2]), 1000);
    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((a, b) => a + b, 0);
    const embed = new EmbedBuilder().setColor(0xfee75c).setTitle(`🎲 Rolled ${count}d${sides}`)
      .addFields({ name: 'Rolls', value: rolls.join(', '), inline: true }, { name: 'Total', value: `**${total}**`, inline: true }).setTimestamp();
    interaction.reply({ embeds: [embed] });
  },
};
