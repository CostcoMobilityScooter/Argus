const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const EMOJI_NUMBERS = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];

module.exports = {
  data: new SlashCommandBuilder().setName('poll').setDescription('Create a reaction poll (up to 10 options)')
    .addStringOption(o => o.setName('question').setDescription('Poll question').setRequired(true))
    .addStringOption(o => o.setName('option1').setDescription('Option 1').setRequired(true))
    .addStringOption(o => o.setName('option2').setDescription('Option 2').setRequired(true))
    .addStringOption(o => o.setName('option3').setDescription('Option 3').setRequired(false))
    .addStringOption(o => o.setName('option4').setDescription('Option 4').setRequired(false))
    .addStringOption(o => o.setName('option5').setDescription('Option 5').setRequired(false)),
  category: 'Utility', cooldown: 10,
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const options  = [];
    for (let i = 1; i <= 5; i++) { const v = interaction.options.getString(`option${i}`); if (v) options.push(v); }
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(`📊 ${question}`)
      .setDescription(options.map((opt, i) => `${EMOJI_NUMBERS[i]} ${opt}`).join('\n'))
      .setFooter({ text: `Poll by ${interaction.user.tag}` }).setTimestamp();
    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    for (let i = 0; i < options.length; i++) await msg.react(EMOJI_NUMBERS[i]);
  },
};
