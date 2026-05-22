const config            = require('./config');
const { checkBadWords } = require('./modules/badWords');
const { checkSpam }     = require('./modules/antiSpam');
const { checkLinks }    = require('./modules/antiLink');
const { checkCaps }     = require('./modules/capsFilter');

async function runAutomod(message) {
  if (!message.guild || message.author.bot || !message.member) return false;
  const inIgnoredChannel = config.ignoredChannels.some(c => message.channel.id === c || message.channel.name === c);
  if (inIgnoredChannel) return false;
  const hasIgnoredRole = message.member.roles.cache.some(r => config.ignoredRoles.includes(r.id) || config.ignoredRoles.includes(r.name));
  if (hasIgnoredRole) return false;
  if (await checkBadWords(message)) return true;
  if (await checkLinks(message))    return true;
  if (await checkCaps(message))     return true;
  if (await checkSpam(message))     return true;
  return false;
}

module.exports = { runAutomod };
