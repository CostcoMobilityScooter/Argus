const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('makequote')
    .setDescription('Turn someone\'s message into a beautiful quote image')
    .addUserOption(o =>
      o.setName('user').setDescription('Who said it').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('quote').setDescription('What they said').setRequired(true).setMaxLength(200)
    ),
  category: 'Utility',
  cooldown: 5,

  async execute(interaction) {
    await interaction.deferReply();

    const user  = interaction.options.getUser('user');
    const quote = interaction.options.getString('quote');

    // ── Canvas setup ──────────────────────────────────────────
    const width  = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx    = canvas.getContext('2d');

    // Dark background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Load and draw faded avatar
    try {
      const avatarURL = user.displayAvatarURL({ extension: 'png', size: 512 });
      const avatar    = await loadImage(avatarURL);

      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.drawImage(avatar, width / 2 - 200, 0, 400, 400);
      ctx.restore();

      // Gradient overlay to fade edges
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 250);
      gradient.addColorStop(0,   'rgba(26, 26, 46, 0)');
      gradient.addColorStop(1,   'rgba(26, 26, 46, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } catch { /* avatar failed to load */ }

    // Quote marks
    ctx.fillStyle = '#5865f2';
    ctx.font      = 'bold 120px sans-serif';
    ctx.globalAlpha = 0.4;
    ctx.fillText('"', 30, 120);
    ctx.globalAlpha = 1;

    // Quote text — word wrap
    ctx.fillStyle   = '#ffffff';
    ctx.font        = 'bold 28px sans-serif';
    ctx.textAlign   = 'center';
    ctx.globalAlpha = 1;

    const words     = quote.split(' ');
    const lines     = [];
    let currentLine = '';
    const maxWidth  = 680;

    for (const word of words) {
      const testLine  = currentLine ? `${currentLine} ${word}` : word;
      const metrics   = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight  = 40;
    const totalHeight = lines.length * lineHeight;
    const startY      = (height - totalHeight) / 2 + 10;

    lines.forEach((line, i) => {
      ctx.fillText(`"${i === 0 ? '' : ''}${line}${i === lines.length - 1 ? '"' : ''}`, width / 2, startY + i * lineHeight);
    });

    // Author name
    ctx.fillStyle = '#5865f2';
    ctx.font      = 'italic 22px sans-serif';
    ctx.fillText(`— ${user.username}`, width / 2, height - 40);

    // Border
    ctx.strokeStyle = '#5865f2';
    ctx.lineWidth   = 3;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Send image
    const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'quote.png' });
    await interaction.editReply({ files: [attachment] });
  },
};