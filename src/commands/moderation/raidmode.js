const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { unlock } = require('../../automod/modules/antiRaid');

module.exports = {
  data: new SlashCommandBuilder().setName('raidmode').setDescription('Enable or disable raid lockdown')
    .addStringOption(o => o.setName('action').setDescription('on or off').setRequired(true)
      .addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' }))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Moderation', userPermissions: ['Administrator'], cooldown: 5,
  async execute(interaction) {
    const action = interaction.options.getString('action');
    const { guild } = interaction;
    await interaction.deferReply();
    const everyone     = guild.roles.everyone;
    const textChannels = guild.channels.cache.filter(c => c.type === 0 && c.manageable);
    if (!textChannels.size) return interaction.editReply('❌ I don\'t have permission to manage any channels.');

    if (action === 'on') {
      let locked = 0;
      for (const [, ch] of textChannels) {
        try { await ch.permissionOverwrites.edit(everyone, { SendMessages: false }); locked++; } catch { /* skip */ }
      }
      return interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xff4444).setTitle('🔒 Raid Mode Enabled').setDescription(`Locked **${locked}** channel(s). Use \`/raidmode off\` to unlock.`).setTimestamp()] });
    }

    unlock(guild.id);
    let unlocked = 0;
    for (const [, ch] of textChannels) {
      try { await ch.permissionOverwrites.edit(everyone, { SendMessages: null }); unlocked++; } catch { /* skip */ }
    }
    interaction.editReply({ embeds: [new EmbedBuilder().setColor(0x57f287).setTitle('🔓 Raid Mode Disabled').setDescription(`Unlocked **${unlocked}** channel(s).`).setTimestamp()] });
  },
};
