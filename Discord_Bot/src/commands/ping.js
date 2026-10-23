const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Kiem tra bot co hoat dong khong')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction, client) { 
    await interaction.reply(
      `Pong! Độ trễ gateway: ${client.ws.ping} ms`
    );
  }
};