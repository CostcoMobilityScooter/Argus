const { runAutomod } = require('../automod/index');
const { handleXP }   = require('../levels/xpHandler');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;
    const actioned = await runAutomod(message);
    if (actioned) return;
    await handleXP(message);
  },
};
