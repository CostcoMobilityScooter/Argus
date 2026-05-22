const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { queues } = require('./play');

module.exports = {
  data: new SlashCommandBuilder().setName('music').setDescription('Music controls')
    .addSubcommand(s => s.setName('skip').setDescription('Skip the current song'))
    .addSubcommand(s => s.setName('stop').setDescription('Stop music and clear the queue'))
    .addSubcommand(s => s.setName('pause').setDescription('Pause the current song'))
    .addSubcommand(s => s.setName('resume').setDescription('Resume the current song'))
    .addSubcommand(s => s.setName('queue').setDescription('View the current queue'))
    .addSubcommand(s => s.setName('nowplaying').setDescription('See what is currently playing'))
    .addSubcommand(s => s.setName('volume').setDescription('Set the volume').addIntegerOption(o => o.setName('level').setDescription('Volume (1-100)').setMinValue(1).setMaxValue(100).setRequired(true))),
  category: 'Music', cooldown: 2,

  async execute(interaction) {
    const sub   = interaction.options.getSubcommand();
    const queue = queues.get(interaction.guild.id);
    if (!interaction.member.voice.channel) return interaction.reply({ content: '❌ You need to be in a voice channel!', ephemeral: true });
    if (!queue || queue.songs.length === 0) {
      if (sub !== 'stop') return interaction.reply({ content: '❌ Nothing is playing right now!', ephemeral: true });
    }

    if (sub === 'skip') {
      const skipped = queue.songs[0];
      queue.player.stop();
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle('⏭ Skipped').setDescription(`Skipped **${skipped.title}**`).setTimestamp()] });
    }
    if (sub === 'stop') {
      if (queue) queue.destroy();
      queues.delete(interaction.guild.id);
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff4444).setTitle('⏹ Stopped').setDescription('Music stopped and queue cleared.').setTimestamp()] });
    }
    if (sub === 'pause') {
      if (queue.player.state.status === AudioPlayerStatus.Paused) return interaction.reply({ content: '❌ Already paused!', ephemeral: true });
      queue.player.pause(); queue.paused = true;
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setTitle('⏸ Paused').setDescription(`Paused **${queue.songs[0].title}**`).setTimestamp()] });
    }
    if (sub === 'resume') {
      if (queue.player.state.status !== AudioPlayerStatus.Paused) return interaction.reply({ content: '❌ Not paused!', ephemeral: true });
      queue.player.unpause(); queue.paused = false;
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setTitle('▶️ Resumed').setDescription(`Resumed **${queue.songs[0].title}**`).setTimestamp()] });
    }
    if (sub === 'nowplaying') {
      const song = queue.songs[0];
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle('🎵 Now Playing').setDescription(`**[${song.title}](${song.url})**`).addFields({ name: '⏱ Duration', value: song.duration, inline: true }, { name: '👤 Requested by', value: song.requestedBy, inline: true }, { name: '📋 In Queue', value: `${queue.songs.length} song(s)`, inline: true }).setThumbnail(song.thumbnail).setTimestamp()] });
    }
    if (sub === 'queue') {
      const songs = queue.songs.slice(0, 10);
      const desc  = songs.map((s, i) => i === 0 ? `▶️ **${s.title}** (Now Playing)` : `**${i}.** ${s.title}`).join('\n');
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle('📋 Music Queue').setDescription(desc || 'Queue is empty').setFooter({ text: `${queue.songs.length} song(s) in queue` }).setTimestamp()] });
    }
    if (sub === 'volume') {
      const level = interaction.options.getInteger('level');
      queue.volume = level / 100;
      if (queue.player.state.resource?.volume) queue.player.state.resource.volume.setVolume(queue.volume);
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle('🔊 Volume Changed').setDescription(`Volume set to **${level}%**`).setTimestamp()] });
    }
  },
};
