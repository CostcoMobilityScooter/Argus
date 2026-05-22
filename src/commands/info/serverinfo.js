const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('serverinfo').setDescription('Display server information'),
  category: 'Info', cooldown: 10,
  async execute(interaction) {
    const { guild } = interaction;
    await guild.fetch();
    const textCount  = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceCount = guild.channels.cache.filter(c => c.type === 2).size;
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(guild.name)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: '🆔 Server ID', value: guild.id, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
        { name: '💬 Text Ch.', value: `${textCount}`, inline: true },
        { name: '🔊 Voice Ch.', value: `${voiceCount}`, inline: true },
        { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
        { name: '🔒 Verification', value: guild.verificationLevel.toString(), inline: true },
      )
      .setImage(guild.bannerURL({ size: 1024 }) ?? null)
      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  },
};
