const fs   = require('fs');
const path = require('path');

function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const categories   = fs.readdirSync(commandsPath);
  let loaded = 0;
  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const command = require(path.join(categoryPath, file));
      if (!command?.data?.name) continue;
      client.commands.set(command.data.name, command);
      loaded++;
    }
  }
  console.log(`[Commands] Loaded ${loaded} slash commands.`);
}

module.exports = { loadCommands };
