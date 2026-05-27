const { EmbedBuilder } = require('discord.js');
const ms = require('ms');
const { sendLog } = require('../utils/logger');

const MOD_COMMANDS = ['ban', 'kick', 'timeout', 'warn', 'purge'];

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    if (command.ownerOnly && interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({ content: '🚫 This command is reserved for the bot owner.', ephemeral: true });
    }

    if (command.userPermissions?.length) {
      const missing = interaction.member.permissions.missing(command.userPermissions);
      if (missing.length) {
        return interaction.reply({ content: `🔒 You need: **${missing.join(', ')}**`, ephemeral: true });
      }
    }

    const cooldownSeconds = command.cooldown ?? 3;
    const key     = `${interaction.user.id}-${command.data.name}`;
    const now     = Date.now();
    const expires = client.cooldowns.get(key);
    if (expires && now < expires) {
      const remaining = ms(expires - now, { long: true });
      return interaction.reply({ content: `⏳ Wait **${remaining}** before using this again.`, ephemeral: true });
    }
    client.cooldowns.set(key, now + cooldownSeconds * 1_000);
    setTimeout(() => client.cooldowns.delete(key), cooldownSeconds * 1_000);

    try {
      await command.execute(interaction, client);

      // ── Log moderation commands ───────────────────────────
      if (MOD_COMMANDS.includes(command.data.name) && interaction.guild) {
        const target = interaction.options.getMember?.('user') ?? interaction.options.getUser?.('user');
        const reason = interaction.options.getString?.('reason') ?? 'No reason provided';

        const colorMap = {
          ban:     0xff4444,
          kick:    0xfee75c,
          timeout: 0xeb459e,
          warn:    0xfee75c,
          purge:   0x5865f2,
        };

        await sendLog(interaction.guild, {
          color: colorMap[command.data.name] ?? 0x5865f2,
          title: `🔨 Moderation — /${command.data.name}`,
          fields: [
            { name: '👮 Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
            { name: '👤 Target',    value: target ? `${target.user?.tag ?? target.tag} (${target.id})` : 'N/A', inline: true },
            { name: '📝 Reason',    value: reason },
          ],
          footer: `Used in #${interaction.channel.name}`,
        });
      }

    } catch (err) {
      console.error(`[Command Error] /${command.data.name}:`, err);
      const errEmbed = new EmbedBuilder().setColor(0xff4444).setTitle('❌ Something went wrong').setDescription('An unexpected error occurred.').setTimestamp();
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errEmbed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [errEmbed], ephemeral: true });
      }
    }
  },
};