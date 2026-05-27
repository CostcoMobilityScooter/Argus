const { EmbedBuilder } = require('discord.js');
const { checkRaid }         = require('../automod/modules/antiRaid');
const { getWelcomeChannel } = require('../levels/database');
const { sendLog }           = require('../utils/logger');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    await checkRaid(member);

    // ── Welcome message ───────────────────────────────────────
    const channelId = getWelcomeChannel(member.guild.id);
    const channel   = channelId
      ? member.guild.channels.cache.get(channelId)
      : member.guild.channels.cache.find(c => c.name === 'welcome' || c.name === 'general');

    if (channel) {
      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle('👋 Welcome!')
        .setDescription(`Hey ${member}, welcome to **${member.guild.name}**!\n\nYou are member **#${member.guild.memberCount}**.\nCheck out the rules and enjoy your stay! 🎉`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
      await channel.send({ embeds: [embed] });
    }

    // ── Log join ──────────────────────────────────────────────
    await sendLog(member.guild, {
      color: 0x57f287,
      title: '📥 Member Joined',
      thumbnail: member.user.displayAvatarURL({ dynamic: true }),
      fields: [
        { name: '👤 User',      value: `${member.user.tag} (${member.user.id})`, inline: true },
        { name: '📅 Created',   value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '👥 Members',   value: `${member.guild.memberCount}`, inline: true },
      ],
      footer: 'Member Joined',
    });
  },
};