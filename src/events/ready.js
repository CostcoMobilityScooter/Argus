const { ActivityType } = require('discord.js');
const { setupStatsChannels } = require('../utils/statsSetup');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`\n✅  Argus is online as ${client.user.tag}`);
    console.log(`    Serving ${client.guilds.cache.size} guild(s)\n`);

    const statuses = [
      { name: 'your commands',      type: ActivityType.Listening },
      { name: 'over the server',    type: ActivityType.Watching  },
      { name: '/help for commands', type: ActivityType.Playing   },
    ];
    let i = 0;
    const setStatus = () => { client.user.setActivity(statuses[i % statuses.length]); i++; };
    setStatus();
    setInterval(setStatus, 30_000);

    for (const [, guild] of client.guilds.cache) {
      try {
        await guild.members.fetch();
        await setupStatsChannels(guild);
      } catch (err) {
        console.error(`[Stats] Failed for ${guild.name}:`, err.message);
      }
    }

    setInterval(async () => {
      for (const [, guild] of client.guilds.cache) {
        try {
          await guild.members.fetch();
          const category = guild.channels.cache.find(c => c.name === '📊 Server Stats');
          if (!category) continue;
          const statsMap = {
            '👥': `👥 Members: ${guild.memberCount}`,
            '🤖': `🤖 Bots: ${guild.members.cache.filter(m => m.user.bot).size}`,
            '🎭': `🎭 Roles: ${guild.roles.cache.size}`,
            '💬': `💬 Channels: ${guild.channels.cache.filter(c => c.type === 0).size}`,
          };
          const children = guild.channels.cache.filter(c => c.parentId === category.id);
          for (const [, ch] of children) {
            const emoji = ch.name.split(' ')[0];
            if (statsMap[emoji]) await ch.setName(statsMap[emoji]).catch(() => {});
          }
        } catch (err) {
          console.error(`[Stats] Update failed:`, err.message);
        }
      }
    }, 10 * 60 * 1000);
  },
};
