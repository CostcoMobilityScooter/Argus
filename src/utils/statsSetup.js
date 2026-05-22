const { ChannelType, PermissionFlagsBits } = require('discord.js');

async function setupStatsChannels(guild) {
  let category = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === '📊 Server Stats');
  if (!category) {
    category = await guild.channels.create({
      name: '📊 Server Stats',
      type: ChannelType.GuildCategory,
      permissionOverwrites: [{ id: guild.roles.everyone, deny: [PermissionFlagsBits.Connect] }],
    });
  }

  const statsChannels = [
    { name: () => `👥 Members: ${guild.memberCount}` },
    { name: () => `🤖 Bots: ${guild.members.cache.filter(m => m.user.bot).size}` },
    { name: () => `🎭 Roles: ${guild.roles.cache.size}` },
    { name: () => `💬 Channels: ${guild.channels.cache.filter(c => c.type === 0).size}` },
  ];

  for (const stat of statsChannels) {
    const existing = guild.channels.cache.find(c => c.parentId === category.id && c.name.startsWith(stat.name().split(':')[0]));
    if (!existing) {
      await guild.channels.create({
        name: stat.name(),
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: [{ id: guild.roles.everyone, deny: [PermissionFlagsBits.Connect] }],
      });
    }
  }
  console.log(`[Stats] Channels set up for ${guild.name}`);
}

module.exports = { setupStatsChannels };
