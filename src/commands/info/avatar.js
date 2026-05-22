const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('avatar').setDescription("Get a user's avatar")
    .addUserOption(o => o.setName('user').setDescription('User (defaults to you)').setRequired(false)),
  category: 'Info', cooldown: 3,
  async execute(interaction) {
    const user = interaction.options.getUser('user') ?? interaction.user;
    const url  = user.displayAvatarURL({ dynamic: true, size: 4096 });
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(`${user.tag}'s Avatar`).setImage(url).setURL(url).setTimestamp();
    interaction.reply({ embeds: [embed] });
  },
};
