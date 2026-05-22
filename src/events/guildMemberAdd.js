const { EmbedBuilder } = require('discord.js');
const { checkRaid }    = require('../automod/modules/antiRaid');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    await checkRaid(member);

    const channel = member.guild.channels.cache.find(
      c => c.name === 'welcome' || c.name === 'general'
    );
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('👋 Welcome!')
      .setDescription(`Hey ${member}, welcome to **${member.guild.name}**!\n\nYou are member **#${member.guild.memberCount}**.\nCheck out the rules and enjoy your stay! 🎉`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  },
};
