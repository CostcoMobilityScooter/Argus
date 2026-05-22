const config = require('../config');
const { logAction } = require('../logger');

const spamMap = new Map();

async function checkSpam(message) {
  if (!config.antiSpam.enabled) return false;
  const userId = message.author.id;
  const now    = Date.now();
  const { maxMessages, timeWindow, timeoutDuration, action } = config.antiSpam;
  const timestamps = spamMap.get(userId) ?? [];
  const recent = timestamps.filter(t => now - t < timeWindow);
  recent.push(now);
  spamMap.set(userId, recent);
  setTimeout(() => {
    const current  = spamMap.get(userId) ?? [];
    const filtered = current.filter(t => Date.now() - t < timeWindow);
    if (filtered.length === 0) spamMap.delete(userId); else spamMap.set(userId, filtered);
  }, timeWindow);
  if (recent.length < maxMessages) return false;
  spamMap.set(userId, []);
  try {
    const msgs     = await message.channel.messages.fetch({ limit: 10 });
    const userMsgs = msgs.filter(m => m.author.id === userId).first(maxMessages);
    await message.channel.bulkDelete(userMsgs, true).catch(() => {});
  } catch { /* ignore */ }
  if (action === 'timeout' && message.member?.moderatable) await message.member.timeout(timeoutDuration, 'Automod: Spam').catch(() => {});
  else if (action === 'kick' && message.member?.kickable) await message.member.kick('Automod: Spam').catch(() => {});
  const warn = await message.channel.send(`${message.author} ${config.antiSpam.message}`).catch(() => {});
  if (warn) setTimeout(() => warn.delete().catch(() => {}), 5000);
  await logAction(message.guild, { type: 'Anti-Spam', user: message.author, reason: `Sent ${recent.length} messages in ${timeWindow / 1000}s`, action, extra: `Channel: ${message.channel}` });
  return true;
}

module.exports = { checkSpam };
