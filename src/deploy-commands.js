require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs   = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

for (const category of fs.readdirSync(commandsPath)) {
  const catPath = path.join(commandsPath, category);
  if (!fs.statSync(catPath).isDirectory()) continue;
  for (const file of fs.readdirSync(catPath).filter(f => f.endsWith('.js'))) {
    const cmd = require(path.join(catPath, file));
    if (cmd?.data?.toJSON) commands.push(cmd.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Deploying ${commands.length} slash command(s)...`);
    const route = process.env.GUILD_ID
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.CLIENT_ID);
    const data = await rest.put(route, { body: commands });
    console.log(`✅ Successfully registered ${data.length} command(s).`);
  } catch (err) {
    console.error('❌ Deploy failed:', err);
  }
})();
