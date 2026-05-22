const { SlashCommandBuilder, EmbedBuilder, version: djsVersion } = require('discord.js');
const os = require('os');

function formatUptime(ms) {
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24);
  return `${d}d ${h % 24}h ${m % 60}m ${s % 60}s`;
}

module.exports = {
  data: new SlashCommandBuilder().setName('botinfo').setDescription('Show stats about Argus'),
  category: 'Info', cooldown: 10,
  async execute(interaction, client) {
    const mem = process.memoryUsage();
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(`${client.user.username} — Bot Info`)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: '⏱ Uptime',      value: formatUptime(client.uptime),                     inline: true },
        { name: '🏓 Ping',       value: `${client.ws.ping}ms`,                           inline: true },
        { name: '💾 Memory',     value: `${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB`, inline: true },
        { name: '🖥 Platform',   value: `${os.type()} ${os.arch()}`,                      inline: true },
        { name: '📦 Node.js',    value: process.version,                                  inline: true },
        { name: '📚 Discord.js', value: `v${djsVersion}`,                                 inline: true },
        { name: '🏠 Guilds',     value: `${client.guilds.cache.size}`,                    inline: true },
        { name: '👥 Users',      value: `${client.users.cache.size}`,                     inline: true },
        { name: '⚡ Commands',   value: `${client.commands.size}`,                        inline: true },
      ).setTimestamp();
    interaction.reply({ embeds: [embed] });
  },
};
