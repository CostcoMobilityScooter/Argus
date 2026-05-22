const { createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, NoSubscriberBehavior } = require('@discordjs/voice');
const playdl = require('play-dl');

class MusicQueue {
  constructor(interaction, connection) {
    this.interaction = interaction;
    this.connection  = connection;
    this.songs       = [];
    this.volume      = 1;
    this.paused      = false;
    this.playing     = false;

    this.player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
    this.connection.subscribe(this.player);

    this.player.on(AudioPlayerStatus.Idle, () => { this.songs.shift(); this.processQueue(); });
    this.player.on('error', err => { console.error('[Music] Player error:', err.message); this.songs.shift(); this.processQueue(); });

    this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([entersState(this.connection, VoiceConnectionStatus.Signalling, 5_000), entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000)]);
      } catch { this.destroy(); }
    });
  }

  async processQueue() {
    if (this.songs.length === 0) {
      this.playing = false;
      setTimeout(() => { if (this.songs.length === 0) this.destroy(); }, 2 * 60 * 1000);
      return;
    }
    this.playing = true;
    const song = this.songs[0];
    try {
      const stream   = await playdl.stream(song.url, { quality: 0 });
      const resource = createAudioResource(stream.stream, { inputType: stream.type, inlineVolume: true });
      resource.volume?.setVolume(this.volume);
      this.player.play(resource);
    } catch (err) {
      console.error('[Music] Stream error:', err.message);
      this.songs.shift();
      this.processQueue();
    }
  }

  destroy() {
    this.songs = []; this.playing = false;
    try { this.player.stop(); }        catch { /* ignore */ }
    try { this.connection.destroy(); } catch { /* ignore */ }
  }
}

module.exports = MusicQueue;
