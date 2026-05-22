const config = require('../config');
const { logAction } = require('../logger');

const INVITE_REGEX = /(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/[a-zA-Z0-9]+/i;
const URL_REGEX    = /https?:\/\/[^\s]+/i;

async function checkLinks(message) {
  if (!config.antiLink.enabled) return false;
  const { blockAllLinks, blockInvites, ignoredRoles } = config.antiLink;
  if (ignoredRoles.length) {
    const hasIgnored = message.member?.roles.cache.some(r => ignoredRoles.includes(r.id) || ignoredRoles.includes(r.name));
    if (hasIgnored) return false;
  }
  const isInvite     = INVITE_REGEX.test(message.content);
  const isLink       = URL_REGEX.test(message.content);
  const shouldDelete = blockAllLinks ? isLink : (blockInvites && isInvite);
  if (!shouldDelete) return false;
  await message.delete().catch(() => {});
  const warn = await message.channel.send(`${message.author} ${config.antiLink.message}`).catch(() => {});
  if (warn) setTimeout(() => warn.delete().catch(() => {}), 5000);
  await logAction(message.guild, { type: 'Anti-Link', user: message.author, reason: isInvite ? 'Posted a Discord invite' : 'Posted an external link', action: 'Delete', extra: `Channel: ${message.channel}` });
  return true;
}

module.exports = { checkLinks };
