const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../automod/config');

module.exports = {
  data: new SlashCommandBuilder().setName('automod').setDescription('View automod settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  category: 'Moderation', userPermissions: ['ManageGuild'], cooldown: 5,
  async execute(interaction) {
    const s = v => v ? '✅ Enabled' : '❌ Disabled';
    const embed = new EmbedBuilder().setColor(0xeb459e).setTitle('🛡 Automod Settings')
      .addFields(
        { name: '🤬 Bad Word Filter', value: `${s(config.badWords.enabled)}\nWords: ${config.badWords.words.length}\nAction: ${config.badWords.action}`, inline: true },
        { name: '💬 Anti-Spam', value: `${s(config.antiSpam.enabled)}\nMax: ${config.antiSpam.maxMessages} msgs/${config.antiSpam.timeWindow/1000}s\nAction: ${config.antiSpam.action}`, inline: true },
        { name: '🔗 Anti-Link', value: `${s(config.antiLink.enabled)}\nInvites: ${config.antiLink.blockInvites ? '✅' : '❌'}\nAll links: ${config.antiLink.blockAllLinks ? '✅' : '❌'}`, inline: true },
        { name: '🔠 Caps Filter', value: `${s(config.capsFilter.enabled)}\nMax caps: ${config.capsFilter.maxCapsPercent}%\nMin length: ${config.capsFilter.minLength}`, inline: true },
        { name: '🚨 Anti-Raid', value: `${s(config.antiRaid.enabled)}\nThreshold: ${config.antiRaid.joinThreshold} joins/${config.antiRaid.joinWindow/1000}s\nAction: ${config.antiRaid.action}`, inline: true },
        { name: '⚙️ Global', value: `Log: #${config.logChannelName}\nIgnored: ${config.ignoredChannels.join(', ') || 'None'}` },
      )
      .setFooter({ text: 'Edit src/automod/config.js to change settings' }).setTimestamp();
    interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
