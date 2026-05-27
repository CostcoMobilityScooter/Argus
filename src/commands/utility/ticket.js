const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ticket system management')
    .addSubcommand(s => s.setName('setup').setDescription('Set up the ticket system'))
    .addSubcommand(s => s.setName('close').setDescription('Close the current ticket'))
    .addSubcommand(s => s.setName('add').setDescription('Add a user to this ticket')
      .addUserOption(o => o.setName('user').setDescription('User to add').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove a user from this ticket')
      .addUserOption(o => o.setName('user').setDescription('User to remove').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  category: 'Utility',
  userPermissions: ['ManageChannels'],
  cooldown: 5,

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    // ── Setup ─────────────────────────────────────────────────
    if (sub === 'setup') {
      await interaction.deferReply({ ephemeral: true });

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle('🎫 Ticket Setup')
            .setDescription('Click **Configure** to set up your ticket system.')
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_setup_start').setLabel('Configure').setEmoji('⚙️').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('ticket_setup_cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger),
          )
        ],
      });

      const collector = interaction.channel.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 5 * 60 * 1000,
      });

      let config = {
        panelChannelId: null,
        categoryName:   'Tickets',
        staffRoleId:    null,
        title:          'Support Tickets',
        description:    'Click the button below to open a support ticket!',
      };

      collector.on('collect', async i => {

        if (i.customId === 'ticket_setup_cancel') {
          await i.deferUpdate();
          await interaction.editReply({
            embeds: [new EmbedBuilder().setColor(0xff4444).setTitle('🗑 Cancelled').setDescription('Ticket setup cancelled.')],
            components: [],
          });
          collector.stop();
          return;
        }

        if (i.customId === 'ticket_setup_start') {
          const modal = new ModalBuilder()
            .setCustomId('ticket_setup_modal')
            .setTitle('Ticket System Setup')
            .addComponents(
              new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('panel_title').setLabel('Panel Title').setStyle(TextInputStyle.Short).setValue('Support Tickets').setRequired(true)
              ),
              new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('panel_desc').setLabel('Panel Description').setStyle(TextInputStyle.Paragraph).setValue('Click the button below to open a support ticket!').setRequired(true)
              ),
              new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('category_name').setLabel('Ticket Category Name').setStyle(TextInputStyle.Short).setValue('Tickets').setRequired(true)
              ),
              new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('staff_role').setLabel('Staff Role Name (exact)').setStyle(TextInputStyle.Short).setPlaceholder('e.g. Moderator, Staff, Admin').setRequired(true)
              ),
              new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('panel_channel').setLabel('Panel Channel Name (exact)').setStyle(TextInputStyle.Short).setPlaceholder('e.g. open-a-ticket').setRequired(true)
              ),
            );

          await i.showModal(modal);

          try {
            const submitted = await i.awaitModalSubmit({ time: 120_000 });
            await submitted.deferUpdate();

            config.title        = submitted.fields.getTextInputValue('panel_title');
            config.description  = submitted.fields.getTextInputValue('panel_desc');
            config.categoryName = submitted.fields.getTextInputValue('category_name');
            const staffRoleName = submitted.fields.getTextInputValue('staff_role');
            const panelChanName = submitted.fields.getTextInputValue('panel_channel');

            // Find staff role
            const staffRole = interaction.guild.roles.cache.find(
              r => r.name.toLowerCase() === staffRoleName.toLowerCase()
            );
            if (!staffRole) {
              await interaction.editReply({ content: `❌ Role **${staffRoleName}** not found. Check the spelling and try again.`, embeds: [], components: [] });
              return;
            }
            config.staffRoleId = staffRole.id;

            // Find panel channel
            const panelChannel = interaction.guild.channels.cache.find(
              c => c.name.toLowerCase() === panelChanName.toLowerCase() && c.type === 0
            );
            if (!panelChannel) {
              await interaction.editReply({ content: `❌ Channel **${panelChanName}** not found. Check the spelling and try again.`, embeds: [], components: [] });
              return;
            }
            config.panelChannelId = panelChannel.id;

            // Create or find ticket category
            let category = interaction.guild.channels.cache.find(
              c => c.type === ChannelType.GuildCategory && c.name === config.categoryName
            );
            if (!category) {
              category = await interaction.guild.channels.create({
                name: config.categoryName,
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                  { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
                  { id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
                ],
              });
            }

            // Send the ticket panel
            const panelEmbed = new EmbedBuilder()
              .setColor(0x5865f2)
              .setTitle(`🎫 ${config.title}`)
              .setDescription(config.description)
              .setFooter({ text: interaction.guild.name })
              .setTimestamp();

            const panelRow = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(`ticket_open_${category.id}_${config.staffRoleId}`)
                .setLabel('Open Ticket')
                .setEmoji('🎫')
                .setStyle(ButtonStyle.Primary)
            );

            await panelChannel.send({ embeds: [panelEmbed], components: [panelRow] });

            await interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(0x57f287)
                  .setTitle('✅ Ticket System Set Up!')
                  .setDescription(`Ticket panel sent to ${panelChannel}!\n\n**Config:**\n📁 Category: ${config.categoryName}\n👮 Staff Role: ${staffRole}\n🎫 Panel: ${panelChannel}`)
                  .setTimestamp()
              ],
              components: [],
            });

            collector.stop();

          } catch (err) {
            console.error('[Ticket Setup]', err);
          }
        }
      });

      collector.on('end', (_, reason) => {
        if (reason === 'time') {
          interaction.editReply({
            embeds: [new EmbedBuilder().setColor(0xff4444).setTitle('⏰ Timed Out').setDescription('Setup session expired. Run `/ticket setup` again.')],
            components: [],
          }).catch(() => {});
        }
      });
    }

    // ── Close ─────────────────────────────────────────────────
    if (sub === 'close') {
      if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({ content: '❌ This is not a ticket channel.', ephemeral: true });
      }
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff4444).setTitle('🔒 Ticket Closing').setDescription('This ticket will be deleted in 5 seconds.').setTimestamp()]
      });
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }

    // ── Add user ──────────────────────────────────────────────
    if (sub === 'add') {
      if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({ content: '❌ This is not a ticket channel.', ephemeral: true });
      }
      const user = interaction.options.getUser('user');
      await interaction.channel.permissionOverwrites.edit(user, {
        ViewChannel: true, SendMessages: true, ReadMessageHistory: true,
      });
      interaction.reply({ content: `✅ Added ${user} to the ticket.` });
    }

    // ── Remove user ───────────────────────────────────────────
    if (sub === 'remove') {
      if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({ content: '❌ This is not a ticket channel.', ephemeral: true });
      }
      const user = interaction.options.getUser('user');
      await interaction.channel.permissionOverwrites.edit(user, {
        ViewChannel: false,
      });
      interaction.reply({ content: `✅ Removed ${user} from the ticket.` });
    }
  },
};