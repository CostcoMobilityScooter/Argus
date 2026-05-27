const Database = require('better-sqlite3');
const path = require('path');
const fs   = require('fs');

const dir = path.join(__dirname, '../../data');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(path.join(dir, 'levels.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS levels (
    user_id   TEXT NOT NULL,
    guild_id  TEXT NOT NULL,
    xp        INTEGER DEFAULT 0,
    level     INTEGER DEFAULT 0,
    messages  INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, guild_id)
  );
  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id        TEXT PRIMARY KEY,
    welcome_channel TEXT,
    log_channel     TEXT
  );
`);

function getUser(userId, guildId) {
  let user = db.prepare('SELECT * FROM levels WHERE user_id = ? AND guild_id = ?').get(userId, guildId);
  if (!user) {
    db.prepare('INSERT INTO levels (user_id, guild_id) VALUES (?, ?)').run(userId, guildId);
    user = db.prepare('SELECT * FROM levels WHERE user_id = ? AND guild_id = ?').get(userId, guildId);
  }
  return user;
}

function addXP(userId, guildId, amount) {
  db.prepare('UPDATE levels SET xp = xp + ?, messages = messages + 1 WHERE user_id = ? AND guild_id = ?').run(amount, userId, guildId);
  return getUser(userId, guildId);
}

function setLevel(userId, guildId, level) {
  db.prepare('UPDATE levels SET level = ?, xp = 0 WHERE user_id = ? AND guild_id = ?').run(level, userId, guildId);
}

function getLeaderboard(guildId, limit = 10) {
  return db.prepare('SELECT * FROM levels WHERE guild_id = ? ORDER BY level DESC, xp DESC LIMIT ?').all(guildId, limit);
}

function xpForNextLevel(level) {
  return Math.floor(100 * (level + 1) * 1.5);
}

function setWelcomeChannel(guildId, channelId) {
  db.prepare('INSERT INTO guild_settings (guild_id, welcome_channel) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET welcome_channel = ?').run(guildId, channelId, channelId);
}

function getWelcomeChannel(guildId) {
  const row = db.prepare('SELECT welcome_channel FROM guild_settings WHERE guild_id = ?').get(guildId);
  return row?.welcome_channel ?? null;
}

function setLogChannel(guildId, channelId) {
  db.prepare('INSERT INTO guild_settings (guild_id, log_channel) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET log_channel = ?').run(guildId, channelId, channelId);
}

function getLogChannel(guildId) {
  const row = db.prepare('SELECT log_channel FROM guild_settings WHERE guild_id = ?').get(guildId);
  return row?.log_channel ?? null;
}

module.exports = { getUser, addXP, setLevel, getLeaderboard, xpForNextLevel, setWelcomeChannel, getWelcomeChannel, setLogChannel, getLogChannel };