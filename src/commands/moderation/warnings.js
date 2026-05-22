const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('warnings').setDescription('View warnings for a member')
    .addUserOption(o => o.setName('user').setDescription('Member to check').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  category: 'Moderation', cooldown: 5,
  async execute(interaction, client) {
    const target = interaction.options.getMember('user');
    if (!target) return interaction.reply({ content: '❓ User not found.', ephemeral: true });
    const key   = `${interaction.guild.id}-${target.id}`;
    const warns = client.warnings.get(key) ?? [];
    const embed = new EmbedBuilder().setColor(0xfee75c).setTitle(`⚠️ Warnings — ${target.user.tag}`)
      .setDescription(warns.length === 0 ? 'No warnings on record.' : warns.map((w, i) => `**${i + 1}.** ${w.reason}\n  — by ${w.mod} at ${new Date(w.at).toLocaleString()}`).join('\n\n'))
      .setFooter({ text: `Total: ${warns.length}` }).setTimestamp();
    interaction.reply({ embeds: [embed] });
  },
};
