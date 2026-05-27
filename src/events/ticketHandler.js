const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    // ── Open ticket ───────────────────────────────────────────
    if (interaction.customId.startsWith('ticket_open_')) {
      const parts       = interaction.customId.split('_');
      const categoryId  = parts[2];
      const staffRoleId = parts[3];
      const guild       = interaction.guild;

      const existing = guild.channels.cache.find(
        c => c.name === `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}` && c.parentId === categoryId
      );
      if (existing) {
        return interaction.reply({ content: `❌ You already have an open ticket: ${existing}`, ephemeral: true });
      }

      const ticketChannel = await guild.channels.create({
        name: `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        type: ChannelType.GuildText,
        parent: categoryId,
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
          { id: staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory] },
          { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory] },
        ],
      });

      const ticketEmbed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('🎫 Ticket Opened')
        .setDescription(`Hello ${interaction.user}! Support will be with you shortly.\n\nPlease describe your issue and a staff member will assist you.`)
        .setFooter({ text: 'Click Close Ticket when your issue is resolved.' })
        .setTimestamp();

      const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_close').setLabel('Close Ticket').setEmoji('🔒').setStyle(ButtonStyle.Danger),
      );

      await ticketChannel.send({ content: `${interaction.user} <@&${staffRoleId}>`, embeds: [ticketEmbed], components: [closeRow] });
      await interaction.reply({ content: `✅ Your ticket has been opened: ${ticketChannel}`, ephemeral: true });
      return;
    }

    // ── Close ticket ──────────────────────────────────────────
    if (interaction.customId === 'ticket_close') {
      if (!interaction.channel.name.startsWith('ticket-')) return;
      const closeEmbed = new EmbedBuilder()
        .setColor(0xff4444)
        .setTitle('🔒 Ticket Closing')
        .setDescription('This ticket will be deleted in 5 seconds.')
        .setTimestamp();
      await interaction.update({ components: [] });
      await interaction.channel.send({ embeds: [closeEmbed] });
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
  },
};