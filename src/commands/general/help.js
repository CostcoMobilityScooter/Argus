const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Shows all commands')
    .addStringOption(o => o.setName('command').setDescription('Specific command').setRequired(false)),
  category: 'General', cooldown: 5,
  async execute(interaction, client) {
    const query = interaction.options.getString('command');
    if (query) {
      const cmd = client.commands.get(query.toLowerCase());
      if (!cmd) return interaction.reply({ content: `❓ No command \`${query}\` found.`, ephemeral: true });
      const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(`/${cmd.data.name}`).setDescription(cmd.data.description)
        .addFields(
          { name: 'Cooldown', value: `${cmd.cooldown ?? 3}s`, inline: true },
          { name: 'Permissions', value: cmd.userPermissions?.join(', ') || 'None', inline: true },
        ).setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }
    const categories = {};
    for (const [, cmd] of client.commands) {
      const cat = cmd.category ?? 'General';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(`\`/${cmd.data.name}\``);
    }
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle('📖 Argus Command List')
      .setDescription('Use `/help <command>` for details.').setFooter({ text: `${client.commands.size} commands` }).setTimestamp();
    for (const [cat, cmds] of Object.entries(categories)) {
      embed.addFields({ name: `__${cat}__`, value: cmds.join('  ') });
    }
    interaction.reply({ embeds: [embed] });
  },
};
