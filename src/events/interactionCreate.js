const { EmbedBuilder } = require('discord.js');
const ms = require('ms');

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
