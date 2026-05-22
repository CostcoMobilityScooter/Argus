const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('suggest').setDescription('Submit a suggestion')
    .addStringOption(o => o.setName('suggestion').setDescription('Your suggestion').setRequired(true).setMaxLength(1000)),
  category: 'Utility', cooldown: 30,
  async execute(interaction) {
    const suggestion = interaction.options.getString('suggestion');
    const { guild }  = interaction;
    const suggestChannel = guild.channels.cache.find(c => c.name === 'suggestions' || c.name === 'suggestion');
    if (!suggestChannel) return interaction.reply({ content: '❌ No `#suggestions` channel found.', ephemeral: true });

    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle('💡 New Suggestion').setDescription(suggestion)
      .addFields({ name: '👤 Submitted by', value: `${interaction.user}`, inline: true }, { name: '📊 Status', value: '⏳ Pending', inline: true })
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true })).setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('suggest_upvote').setLabel('👍 Upvote (0)').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('suggest_downvote').setLabel('👎 Downvote (0)').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('suggest_status').setLabel('✏️ Set Status').setStyle(ButtonStyle.Secondary),
    );

    const sentMsg = await suggestChannel.send({ embeds: [embed], components: [row] });

    const logChannel = guild.channels.cache.find(c => c.name === 'suggestion-logs' || c.name === 'suggest-logs');
    if (logChannel) {
      const logEmbed = new EmbedBuilder().setColor(0xeb459e).setTitle('📋 Suggestion Log')
        .addFields({ name: 'User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true }, { name: 'Jump To', value: `[Click here](${sentMsg.url})` }, { name: 'Suggestion', value: suggestion })
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true })).setTimestamp();
      await logChannel.send({ embeds: [logEmbed] });
    }

    await interaction.reply({ content: `✅ Your suggestion has been submitted to ${suggestChannel}!`, ephemeral: true });

    let upvotes = 0, downvotes = 0;
    const voters = new Set();

    const collector = sentMsg.createMessageComponentCollector({ componentType: ComponentType.Button });
    collector.on('collect', async i => {
      if (i.customId === 'suggest_status') {
        if (!i.member.permissions.has('ManageGuild')) return i.reply({ content: '🔒 Staff only.', ephemeral: true });
        const statusRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('status_approved').setLabel('✅ Approved').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('status_denied').setLabel('❌ Denied').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId('status_considering').setLabel('🤔 Considering').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('status_implemented').setLabel('🚀 Implemented').setStyle(ButtonStyle.Secondary),
        );
        await i.reply({ content: 'Select a status:', components: [statusRow], ephemeral: true });
        const statusCollector = i.channel.createMessageComponentCollector({
          filter: s => s.user.id === i.user.id && ['status_approved','status_denied','status_considering','status_implemented'].includes(s.customId),
          componentType: ComponentType.Button, time: 30_000, max: 1,
        });
        statusCollector.on('collect', async s => {
          const statusMap = { status_approved: { label: '✅ Approved', color: 0x57f287 }, status_denied: { label: '❌ Denied', color: 0xff4444 }, status_considering: { label: '🤔 Considering', color: 0xfee75c }, status_implemented: { label: '🚀 Implemented', color: 0x5865f2 } };
          const { label, color } = statusMap[s.customId];
          const updatedEmbed = EmbedBuilder.from(sentMsg.embeds[0]).setColor(color).spliceFields(1, 1, { name: '📊 Status', value: label, inline: true });
          await sentMsg.edit({ embeds: [updatedEmbed] });
          await s.deferUpdate();
        });
        return;
      }
      if (voters.has(i.user.id)) return i.reply({ content: '❌ You already voted!', ephemeral: true });
      voters.add(i.user.id);
      if (i.customId === 'suggest_upvote') upvotes++;
      if (i.customId === 'suggest_downvote') downvotes++;
      const updatedRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('suggest_upvote').setLabel(`👍 Upvote (${upvotes})`).setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('suggest_downvote').setLabel(`👎 Downvote (${downvotes})`).setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('suggest_status').setLabel('✏️ Set Status').setStyle(ButtonStyle.Secondary),
      );
      await sentMsg.edit({ components: [updatedRow] });
      await i.reply({ content: '✅ Vote counted!', ephemeral: true });
    });
  },
};
