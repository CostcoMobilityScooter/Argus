const config = require('../config');
const { logAction } = require('../logger');

async function checkCaps(message) {
  if (!config.capsFilter.enabled) return false;
  const { minLength, maxCapsPercent } = config.capsFilter;
  const content = message.content.replace(/[^a-zA-Z]/g, '');
  if (content.length < minLength) return false;
  const capsCount   = content.split('').filter(c => c >= 'A' && c <= 'Z').length;
  const capsPercent = (capsCount / content.length) * 100;
  if (capsPercent <= maxCapsPercent) return false;
  await message.delete().catch(() => {});
  const warn = await message.channel.send(`${message.author} ${config.capsFilter.message}`).catch(() => {});
  if (warn) setTimeout(() => warn.delete().catch(() => {}), 5000);
  await logAction(message.guild, { type: 'Caps Filter', user: message.author, reason: `Message was ${Math.round(capsPercent)}% uppercase`, action: 'Delete', extra: `Channel: ${message.channel}` });
  return true;
}

module.exports = { checkCaps };
