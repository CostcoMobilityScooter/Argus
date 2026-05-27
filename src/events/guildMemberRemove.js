const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../utils/logger');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const roles = member.roles.cache
      .filter(r => r.id !== member.guild.id)
      .map(r => r.toString())
      .join(', ') || 'None';

    await sendLog(member.guild, {
      color: 0xff4444,
      title: '📤 Member Left',
      thumbnail: member.user.displayAvatarURL({ dynamic: true }),
      fields: [
        { name: '👤 User',     value: `${member.user.tag} (${member.user.id})`, inline: true },
        { name: '📅 Joined',   value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : 'Unknown', inline: true },
        { name: '👥 Members',  value: `${member.guild.memberCount}`, inline: true },
        { name: '🎭 Had Roles', value: roles },
      ],
      footer: `Member Left`,
    });
  },
};