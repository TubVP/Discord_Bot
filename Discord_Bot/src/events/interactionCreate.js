const { Events, MessageFlags } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      await interaction.reply({
        content: 'Không tìm thấy lệnh này.',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(
        `Lỗi khi chạy /${interaction.commandName}:`,
        error
      );

      const response = {
        content: 'Đã xảy ra lỗi khi xử lý lệnh.',
        flags: MessageFlags.Ephemeral
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(response).catch(console.error);
      } else {
        await interaction.reply(response).catch(console.error);
      }
    }
  }
};
