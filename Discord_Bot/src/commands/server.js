const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Xem thong tin server hien tai')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction, client) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: 'Lệnh này chỉ dùng trong server.',
        ephemeral: true
      });
      return;
    }

    await interaction.reply(
      `Tên server: ${interaction.guild.name}\n` +
      `Số thành viên: ${interaction.guild.memberCount}`
    );
  }
};