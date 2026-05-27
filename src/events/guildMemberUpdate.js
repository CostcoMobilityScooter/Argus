const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../utils/logger');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {

    // ── Nickname change ───────────────────────────────────────
    if (oldMember.nickname !== newMember.nickname) {
      await sendLog(newMember.guild, {
        color: 0x5865f2,
        title: '✏️ Nickname Changed',
        thumbnail: newMember.user.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: '👤 User',    value: `${newMember.user.tag} (${newMember.user.id})`, inline: true },
          { name: '📝 Before',  value: oldMember.nickname ?? '_None_',                 inline: true },
          { name: '📝 After',   value: newMember.nickname ?? '_None_',                 inline: true },
        ],
      });
    }

    // ── Roles added ───────────────────────────────────────────
    const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id) && r.id !== newMember.guild.id);
    if (addedRoles.size > 0) {
      await sendLog(newMember.guild, {
        color: 0x57f287,
        title: '➕ Role Added',
        thumbnail: newMember.user.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: '👤 User',  value: `${newMember.user.tag} (${newMember.user.id})`, inline: true },
          { name: '🎭 Roles Added', value: addedRoles.map(r => r.toString()).join(', '), inline: true },
        ],
      });
    }

    // ── Roles removed ─────────────────────────────────────────
    const removedRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id) && r.id !== newMember.guild.id);
    if (removedRoles.size > 0) {
      await sendLog(newMember.guild, {
        color: 0xff4444,
        title: '➖ Role Removed',
        thumbnail: newMember.user.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: '👤 User',  value: `${newMember.user.tag} (${newMember.user.id})`, inline: true },
          { name: '🎭 Roles Removed', value: removedRoles.map(r => r.toString()).join(', '), inline: true },
        ],
      });
    }
  },
};