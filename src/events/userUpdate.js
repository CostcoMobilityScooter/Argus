const { sendLog } = require('../utils/logger');

module.exports = {
  name: 'userUpdate',
  async execute(oldUser, newUser, client) {
    // Find all mutual guilds to log in
    const guilds = client.guilds.cache.filter(g =>
      g.members.cache.has(newUser.id)
    );

    // ── Username change ───────────────────────────────────────
    if (oldUser.username !== newUser.username) {
      for (const [, guild] of guilds) {
        await sendLog(guild, {
          color: 0x5865f2,
          title: '✏️ Username Changed',
          thumbnail: newUser.displayAvatarURL({ dynamic: true }),
          fields: [
            { name: '👤 User',   value: `${newUser.tag} (${newUser.id})`, inline: true },
            { name: '📝 Before', value: oldUser.username,                  inline: true },
            { name: '📝 After',  value: newUser.username,                  inline: true },
          ],
        });
      }
    }

    // ── Avatar change ─────────────────────────────────────────
    if (oldUser.avatar !== newUser.avatar) {
      for (const [, guild] of guilds) {
        await sendLog(guild, {
          color: 0x5865f2,
          title: '🖼️ Avatar Changed',
          thumbnail: newUser.displayAvatarURL({ dynamic: true }),
          fields: [
            { name: '👤 User', value: `${newUser.tag} (${newUser.id})`, inline: true },
            { name: '🔗 New Avatar', value: `[Click to view](${newUser.displayAvatarURL({ dynamic: true, size: 4096 })})`, inline: true },
          ],
        });
      }
    }
  },
};