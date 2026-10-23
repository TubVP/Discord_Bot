const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,

  execute(readyClient) {
    console.log(`Bot đã đăng nhập: ${readyClient.user.tag}`);
  }
};
