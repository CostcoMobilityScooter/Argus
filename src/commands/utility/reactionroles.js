const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ComponentType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('reactionroles').setDescription('Build a reaction role message interactively').setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  category: 'Utility', userPermissions: ['ManageRoles'], cooldown: 10,
  async execute(interaction, client) {
    const guild = interaction.guild;
    let title = 'React to get a role!', description = 'Select a role from the menu below.', roles = [], targetChannel = interaction.channel;

    const buildMainMenu = () => {
      const embed = new EmbedBuilder().setColor(0x5865f2).setTitle('🎭 Reaction Role Builder')
        .addFields(
          { name: '📝 Title', value: title }, { name: '📄 Description', value: description },
          { name: '🎭 Roles', value: roles.length === 0 ? '_None added yet_' : roles.map(r => `${r.emoji} <@&${r.roleId}>`).join('\n') },
          { name: '📢 Channel', value: `${targetChannel}` },
        ).setFooter({ text: 'Use the buttons below to configure your message' });
      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('rr_set_title').setLabel('Set Title').setEmoji('📝').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('rr_set_desc').setLabel('Set Description').setEmoji('📄').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('rr_add_role').setLabel('Add Role').setEmoji('➕').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('rr_remove_role').setLabel('Remove Role').setEmoji('➖').setStyle(ButtonStyle.Danger).setDisabled(roles.length === 0),
      );
      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('rr_set_channel').setLabel('Set Channel').setEmoji('📢').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('rr_preview').setLabel('Preview').setEmoji('👁').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('rr_send').setLabel('Send Message').setEmoji('✅').setStyle(ButtonStyle.Success).setDisabled(roles.length === 0),
        new ButtonBuilder().setCustomId('rr_cancel').setLabel('Cancel').setEmoji('🗑').setStyle(ButtonStyle.Danger),
      );
      return { embed, components: [row1, row2] };
    };

    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply(buildMainMenu());

    const collector = interaction.channel.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 10 * 60 * 1000 });

    collector.on('collect', async i => {
      if (i.customId === 'rr_set_title') {
        const modal = new ModalBuilder().setCustomId('rr_modal_title').setTitle('Set Title').addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('title_input').setLabel('Title').setStyle(TextInputStyle.Short).setValue(title).setMaxLength(100).setRequired(true)));
        await i.showModal(modal);
        try { const s = await i.awaitModalSubmit({ time: 60_000 }); title = s.fields.getTextInputValue('title_input'); await s.deferUpdate(); } catch { return; }
        await interaction.editReply(buildMainMenu()); return;
      }
      if (i.customId === 'rr_set_desc') {
        const modal = new ModalBuilder().setCustomId('rr_modal_desc').setTitle('Set Description').addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('desc_input').setLabel('Description').setStyle(TextInputStyle.Paragraph).setValue(description).setMaxLength(500).setRequired(true)));
        await i.showModal(modal);
        try { const s = await i.awaitModalSubmit({ time: 60_000 }); description = s.fields.getTextInputValue('desc_input'); await s.deferUpdate(); } catch { return; }
        await interaction.editReply(buildMainMenu()); return;
      }
      if (i.customId === 'rr_add_role') {
        if (roles.length >= 10) { await i.reply({ content: '❌ Maximum 10 roles.', ephemeral: true }); return; }
        const modal = new ModalBuilder().setCustomId('rr_modal_emoji').setTitle('Add Role — Enter Emoji').addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('emoji_input').setLabel('Emoji (e.g. 🎮)').setStyle(TextInputStyle.Short).setMaxLength(10).setRequired(true)));
        await i.showModal(modal);
        let emoji;
        try { const s = await i.awaitModalSubmit({ time: 60_000 }); emoji = s.fields.getTextInputValue('emoji_input').trim(); await s.deferUpdate(); } catch { return; }
        const available = guild.roles.cache.filter(r => r.id !== guild.id && !r.managed && !roles.find(x => x.roleId === r.id)).sort((a, b) => b.position - a.position).first(25);
        if (!available.length) { await interaction.editReply({ ...buildMainMenu(), content: '❌ No assignable roles.' }); return; }
        const selectRow = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId(`rr_role_select_${emoji}`).setPlaceholder('Select a role...').addOptions(available.map(r => ({ label: r.name, value: r.id }))));
        const cancelRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('rr_back').setLabel('← Back').setStyle(ButtonStyle.Secondary));
        await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle('➕ Add Role').setDescription(`Emoji: **${emoji}**\n\nPick the role to pair with it.`)], components: [selectRow, cancelRow] }); return;
      }
      if (i.customId.startsWith('rr_role_select_')) { const emoji = i.customId.replace('rr_role_select_', ''); roles.push({ emoji, roleId: i.values[0] }); await i.deferUpdate(); await interaction.editReply(buildMainMenu()); return; }
      if (i.customId === 'rr_remove_role') {
        const removeSelect = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('rr_remove_select').setPlaceholder('Select role to remove...').addOptions(roles.map(r => { const role = guild.roles.cache.get(r.roleId); return { label: role?.name ?? 'Unknown', value: r.roleId, emoji: r.emoji }; })));
        const cancelRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('rr_back').setLabel('← Back').setStyle(ButtonStyle.Secondary));
        await i.deferUpdate(); await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xff4444).setTitle('➖ Remove Role').setDescription('Select a role to remove.')], components: [removeSelect, cancelRow] }); return;
      }
      if (i.customId === 'rr_remove_select') { roles = roles.filter(r => r.roleId !== i.values[0]); await i.deferUpdate(); await interaction.editReply(buildMainMenu()); return; }
      if (i.customId === 'rr_set_channel') {
        const channelOptions = guild.channels.cache.filter(c => c.type === 0).sort((a, b) => a.position - b.position).first(25);
        const chanSelect = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('rr_channel_select').setPlaceholder('Select a channel...').addOptions(channelOptions.map(c => ({ label: `#${c.name}`, value: c.id }))));
        const cancelRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('rr_back').setLabel('← Back').setStyle(ButtonStyle.Secondary));
        await i.deferUpdate(); await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle('📢 Set Channel').setDescription('Pick a channel.')], components: [chanSelect, cancelRow] }); return;
      }
      if (i.customId === 'rr_channel_select') { targetChannel = guild.channels.cache.get(i.values[0]); await i.deferUpdate(); await interaction.editReply(buildMainMenu()); return; }
      if (i.customId === 'rr_preview') {
        const roleLines = roles.map(r => `${r.emoji} — <@&${r.roleId}>`).join('\n') || '_No roles yet_';
        const backRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('rr_back').setLabel('← Back').setStyle(ButtonStyle.Secondary));
        await i.deferUpdate(); await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle(title).setDescription(`${description}\n\n${roleLines}`).setFooter({ text: 'Preview — use ← Back to keep editing' }).setTimestamp()], components: [backRow] }); return;
      }
      if (i.customId === 'rr_back') { await i.deferUpdate(); await interaction.editReply(buildMainMenu()); return; }
      if (i.customId === 'rr_cancel') { await i.deferUpdate(); await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xff4444).setTitle('🗑 Cancelled').setDescription('Builder cancelled.')], components: [] }); collector.stop(); return; }
      if (i.customId === 'rr_send') {
        if (roles.length === 0) { await i.reply({ content: '❌ Add at least one role first.', ephemeral: true }); return; }
        const roleLines = roles.map(r => `${r.emoji} — <@&${r.roleId}>`).join('\n');
        const finalEmbed = new EmbedBuilder().setColor(0x5865f2).setTitle(title).setDescription(`${description}\n\n${roleLines}`).setFooter({ text: 'Select your role from the menu below' }).setTimestamp();
        const roleMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('reaction_role_select').setPlaceholder('🎭 Choose a role...').addOptions(roles.map(r => { const role = guild.roles.cache.get(r.roleId); return { label: role?.name ?? 'Unknown', value: r.roleId, emoji: r.emoji }; })));
        const sentMsg = await targetChannel.send({ embeds: [finalEmbed], components: [roleMenu] });
        await i.deferUpdate(); await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0x57f287).setTitle('✅ Sent!').setDescription(`Reaction role message sent to ${targetChannel}!`)], components: [] }); collector.stop();
        const roleCollector = sentMsg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, filter: i => i.customId === 'reaction_role_select' });
        roleCollector.on('collect', async i => {
          const roleId = i.values[0], member = i.member, role = guild.roles.cache.get(roleId);
          if (!role) return i.reply({ content: '❌ Role not found.', ephemeral: true });
          try {
            if (member.roles.cache.has(roleId)) { await member.roles.remove(role); await i.reply({ content: `✅ Removed **${role.name}**.`, ephemeral: true }); }
            else { await member.roles.add(role); await i.reply({ content: `✅ Given **${role.name}**!`, ephemeral: true }); }
          } catch { await i.reply({ content: '❌ Could not assign that role.', ephemeral: true }); }
        });
      }
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xff4444).setTitle('⏰ Timed Out').setDescription('Session expired. Run `/reactionroles` again.')], components: [] }).catch(() => {});
    });
  },
};
