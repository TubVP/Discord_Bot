
require('dotenv').config();

const {
  Client,
  Collection,
  GatewayIntentBits
} = require('discord.js');

const fs = require('node:fs');
const path = require('node:path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// Nạp các slash commands
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath)
  .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if (!command.data || !command.execute) {
    throw new Error(`Command không hợp lệ: ${file}`);
  }

  client.commands.set(command.data.name, command);
}

// Nạp các events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath)
  .filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);

  if (!event.name || !event.execute) {
    throw new Error(`Event không hợp lệ: ${file}`);
  }

  if (event.once) {
    client.once(event.name, (...args) => {
      event.execute(...args, client);
    });
  } else {
    client.on(event.name, (...args) => {
      event.execute(...args, client);
    });
  }
}

// Đăng nhập Discord
client.login(process.env.DISCORD_TOKEN).catch(error => {
  console.error('Không thể đăng nhập bot:', error);
  process.exitCode = 1;
});
