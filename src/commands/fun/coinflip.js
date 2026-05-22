const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('coinflip').setDescription('Flip a coin'),
  category: 'Fun', cooldown: 2,
  async execute(interaction) {
    const result = Math.random() < 0.5 ? '🪙 Heads' : '🪙 Tails';
    const embed = new EmbedBuilder().setColor(0xfee75c).setTitle('Coin Flip').setDescription(`The coin landed on **${result}**!`).setTimestamp();
    interaction.reply({ embeds: [embed] });
  },
};
