const config = require('../config');

const joinMap     = new Map();
const lockedGuilds = new Set();

async function checkRaid(member) {
  if (!config.antiRaid.enabled) return;
  const { joinThreshold, joinWindow, action, lockdownMessage, logChannelName } = config.antiRaid;
  const guildId = member.guild.id;
  const now     = Date.now();
  const joins   = joinMap.get(guildId) ?? [];
  joins.push(now);
  joinMap.set(guildId, joins.filter(t => now - t < joinWindow));
  if (joinMap.get(guildId).length < joinThreshold) return;
  if (lockedGuilds.has(guildId)) return;
  lockedGuilds.add(guildId);
  console.warn(`[AntiRaid] Raid detected in ${member.guild.name}!`);
  const textChannels = member.guild.channels.cache.filter(c => c.type === 0);
  for (const [, ch] of textChannels) await ch.permissionOverwrites.edit(member.guild.roles.everyone, { SendMessages: false }).catch(() => {});
  const logChannel = member.guild.channels.cache.find(c => c.name === logChannelName);
  if (logChannel) await logChannel.send({ content: `@here ${lockdownMessage}\n\nUse \`/raidmode off\` to unlock.` }).catch(() => {});
  const recentJoins = joinMap.get(guildId) ?? [];
  for (const joinTime of recentJoins) {
    const raidMember = member.guild.members.cache.find(m => Math.abs(m.joinedTimestamp - joinTime) < 1000);
    if (!raidMember) continue;
    if (action === 'ban' && raidMember.bannable) await raidMember.ban({ reason: 'Automod: Raid protection' }).catch(() => {});
    else if (action === 'kick' && raidMember.kickable) await raidMember.kick('Automod: Raid protection').catch(() => {});
  }
  joinMap.set(guildId, []);
  setTimeout(async () => {
    lockedGuilds.delete(guildId);
    for (const [, ch] of textChannels) await ch.permissionOverwrites.edit(member.guild.roles.everyone, { SendMessages: null }).catch(() => {});
    if (logChannel) await logChannel.send('✅ Raid lockdown automatically lifted after 10 minutes.').catch(() => {});
  }, 10 * 60 * 1000);
}

function isLocked(guildId) { return lockedGuilds.has(guildId); }
function unlock(guildId)    { lockedGuilds.delete(guildId); }

module.exports = { checkRaid, isLocked, unlock };
