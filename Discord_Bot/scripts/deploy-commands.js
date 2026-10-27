
require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const commandsPath = path.join(
  __dirname,
  '..',
  'src',
  'commands'
);

const commandFiles = fs.readdirSync(commandsPath)
  .filter(file => file.endsWith('.js'));

const commands = commandFiles.map(file => {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  return command.data.toJSON();
});

const rest = new REST({ version: '10' })
  .setToken(process.env.DISCORD_TOKEN);

async function main() {
  try {
    console.log('Dang dang ky cac lenh slash...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [] }
    );

    console.log('Da xoa cac lenh Global cu.');

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log('Dang ky lenh thanh cong!');
  } catch (error) {
    console.error('Loi dang ky lenh:', error);
    process.exitCode = 1;
  }
}

main();
