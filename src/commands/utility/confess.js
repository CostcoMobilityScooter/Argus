const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('confess').setDescription('Send an anonymous confession'),
  category: 'Utility', cooldown: 30,
  async execute(interaction) {
    const modal = new ModalBuilder().setCustomId('confession_modal').setTitle('Anonymous Confession')
      .addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('confession_input').setLabel('Your confession (sent anonymously)')
          .setStyle(TextInputStyle.Paragraph).setPlaceholder('Type your confession here...').setMinLength(5).setMaxLength(1000).setRequired(true)
      ));
    await interaction.showModal(modal);
    let submitted;
    try { submitted = await interaction.awaitModalSubmit({ time: 120_000 }); } catch { return; }
    await submitted.deferReply({ ephemeral: true });
    const confession = submitted.fields.getTextInputValue('confession_input');
    const { guild }  = interaction;

    const confessChannel = guild.channels.cache.find(c => c.name === '↪-floof-confession-box');
    if (!confessChannel) return submitted.editReply({ content: '❌ No confession channel found.' });

    let confessionNumber = 1;
    try {
      const messages = await confessChannel.messages.fetch({ limit: 100 });
      confessionNumber = messages.filter(m => m.author.id === interaction.client.user.id && m.embeds[0]?.title?.startsWith('💌 Confession')).size + 1;
    } catch { /* ignore */ }

    const publicEmbed = new EmbedBuilder().setColor(0x5865f2).setTitle(`💌 Confession #${confessionNumber}`)
      .setDescription(confession).setFooter({ text: 'Submitted anonymously' }).setTimestamp();
    await confessChannel.send({ embeds: [publicEmbed] });

    const logChannel = guild.channels.cache.find(c => c.name === 'con-logs' || c.name === 'confession-logs');
    if (logChannel) {
      const logEmbed = new EmbedBuilder().setColor(0xeb459e).setTitle(`🔍 Confession #${confessionNumber} — Log`)
        .addFields({ name: 'User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true }, { name: 'Mention', value: `${interaction.user}`, inline: true }, { name: 'Confession', value: confession })
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true })).setTimestamp();
      await logChannel.send({ embeds: [logEmbed] });
    }
    await submitted.editReply({ content: `✅ Your confession has been sent anonymously to ${confessChannel}!` });
  },
};
