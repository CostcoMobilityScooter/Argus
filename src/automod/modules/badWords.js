const config = require('../config');
const { logAction } = require('../logger');

async function checkBadWords(message) {
  if (!config.badWords.enabled) return false;
  const content = message.content.toLowerCase();
  const found   = config.badWords.words.some(w => content.includes(w.toLowerCase()));
  if (!found) return false;
  await message.delete().catch(() => {});
  const warn = await message.channel.send(`${message.author} ${config.badWords.message}`).catch(() => {});
  if (warn) setTimeout(() => warn.delete().catch(() => {}), 5000);
  if (config.badWords.action === 'timeout' && message.member?.moderatable) await message.member.timeout(60_000, 'Automod: Bad word').catch(() => {});
  await logAction(message.guild, { type: 'Bad Word Filter', user: message.author, reason: 'Sent a message containing a banned word', action: config.badWords.action, extra: `Channel: ${message.channel}` });
  return true;
}

module.exports = { checkBadWords };
