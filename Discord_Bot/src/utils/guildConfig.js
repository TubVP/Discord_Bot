const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.join(__dirname, '..', '..', 'data');
const filePath = path.join(dataDir, 'guild-config.json');

function readConfigs() {
  fs.mkdirSync(dataDir, { recursive: true });

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '{}', 'utf8');
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getGuildConfig(guildId) {
  const configs = readConfigs();
  return configs[guildId] ?? {};
}

function setGuildConfig(guildId, updates) {
  const configs = readConfigs();

  configs[guildId] = {
    ...(configs[guildId] ?? {}),
    ...updates
  };

  fs.writeFileSync(
    filePath,
    JSON.stringify(configs, null, 2),
    'utf8'
  );
}

module.exports = {
  getGuildConfig,
  setGuildConfig
};