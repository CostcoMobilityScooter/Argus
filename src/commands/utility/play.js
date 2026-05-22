const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const playdl     = require('play-dl');
const MusicQueue = require('../../music/MusicQueue');

const queues = new Map();

module.exports = {
  data: new SlashCommandBuilder().setName('play').setDescription('Play a song or playlist from YouTube')
    .addStringOption(o => o.setName('query').setDescription('YouTube URL, playlist URL, or search term').setRequired(true)),
  category: 'Music', cooldown: 3, queues,

  async execute(interaction) {
    await interaction.deferReply();
    const query        = interaction.options.getString('query');
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return interaction.editReply('❌ You need to be in a voice channel first!');
    const perms = voiceChannel.permissionsFor(interaction.client.user);
    if (!perms.has('Connect') || !perms.has('Speak')) return interaction.editReply('❌ I need **Connect** and **Speak** permissions!');

    let songs = [];
    try {
      const type = await playdl.validate(query);
      if (type === 'yt_playlist') {
        const playlist = await playdl.playlist_info(query, { incomplete: true });
        const videos   = await playlist.all_videos();
        songs = videos.map(v => ({ title: v.title ?? 'Unknown', url: v.url, duration: v.durationRaw ?? 'Unknown', thumbnail: v.thumbnails?.[0]?.url ?? null, requestedBy: interaction.user.tag }));
      } else if (type === 'yt_video') {
        const info = await playdl.video_info(query);
        songs.push({ title: info.video_details.title ?? 'Unknown', url: info.video_details.url, duration: info.video_details.durationRaw ?? 'Unknown', thumbnail: info.video_details.thumbnails?.[0]?.url ?? null, requestedBy: interaction.user.tag });
      } else {
        const results = await playdl.search(query, { limit: 1 });
        if (!results.length) return interaction.editReply('❌ No results found.');
        const v = results[0];
        songs.push({ title: v.title ?? 'Unknown', url: v.url, duration: v.durationRaw ?? 'Unknown', thumbnail: v.thumbnails?.[0]?.url ?? null, requestedBy: interaction.user.tag });
      }
    } catch (err) {
      console.error('[Music] Error:', err);
      return interaction.editReply(`❌ Could not load that video or playlist. Error: ${err.message}`);
    }

    if (!songs.length) return interaction.editReply('❌ No playable songs found.');

    let queue = queues.get(interaction.guild.id);
    if (!queue) {
      const connection = joinVoiceChannel({ channelId: voiceChannel.id, guildId: interaction.guild.id, adapterCreator: interaction.guild.voiceAdapterCreator });
      try { await entersState(connection, VoiceConnectionStatus.Ready, 10_000); } catch { connection.destroy(); return interaction.editReply('❌ Could not connect to your voice channel.'); }
      queue = new MusicQueue(interaction, connection);
      queues.set(interaction.guild.id, queue);
      connection.on(VoiceConnectionStatus.Destroyed, () => queues.delete(interaction.guild.id));
    }

    queue.songs.push(...songs);

    if (songs.length === 1) {
      const song  = songs[0];
      const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(queue.playing ? '📋 Added to Queue' : '🎵 Now Playing')
        .setDescription(`**[${song.title}](${song.url})**`)
        .addFields({ name: '⏱ Duration', value: song.duration, inline: true }, { name: '👤 Requested by', value: song.requestedBy, inline: true }, { name: '📋 Position', value: queue.playing ? `#${queue.songs.length}` : 'Up next', inline: true })
        .setThumbnail(song.thumbnail).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder().setColor(0x5865f2).setTitle('📋 Playlist Added')
        .setDescription(`Added **${songs.length}** songs to the queue!`)
        .addFields({ name: '🎵 First song', value: songs[0].title, inline: true }, { name: '👤 Requested by', value: interaction.user.tag, inline: true }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    if (!queue.playing) queue.processQueue();
  },
};

module.exports.queues = queues;
