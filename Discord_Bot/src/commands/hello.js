const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Bot chao ban')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction, client) {
    await interaction.reply(`Xin chào ${interaction.user}! 👋`);
  }
};