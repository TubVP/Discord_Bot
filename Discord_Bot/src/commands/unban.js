const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');

const MODERATOR_ROLE_ID = '1562543318389227540';
const STAFF_ROLE_ID = '1562542401053270076';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Gỡ ban cho người dùng')
    .addStringOption(option =>
      option
        .setName('user_id')
        .setDescription('Discord User ID của người bị ban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Lý do gỡ ban')
        .setMaxLength(400)
        .setRequired(false)
    ),

  async execute(interaction) {
    // 1. Chỉ cho phép sử dụng lệnh trong server.
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: 'Lệnh này chỉ dùng trong server.',
        flags: MessageFlags.Ephemeral
      });
    }

    const guild = interaction.guild;
    const isOwner = interaction.user.id === guild.ownerId;

    try {
      // 2. Xác minh người thực hiện lệnh.
      const actor = await guild.members.fetch(interaction.user.id);

      // 3. Chỉ Owner, Moderator hoặc Staff được dùng /unban.
      const authorized =
        isOwner ||
        actor.roles.cache.has(MODERATOR_ROLE_ID) ||
        actor.roles.cache.has(STAFF_ROLE_ID);

      if (!authorized) {
        return interaction.reply({
          content: 'Bạn không có quyền sử dụng /unban.',
          flags: MessageFlags.Ephemeral
        });
      }

      // 4. Kiểm tra quyền của bot.
      const botMember = await guild.members.fetchMe();

      if (!botMember.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({
          content: 'Bot chưa có quyền Ban Members.',
          flags: MessageFlags.Ephemeral
        });
      }

      // 5. Lấy User ID và lý do.
      const userId = interaction.options
        .getString('user_id')
        .trim();

      const reason =
        interaction.options.getString('reason')?.trim() ||
        'Không cung cấp lý do';

      // 6. Kiểm tra định dạng User ID.
      if (!/^\d{17,20}$/.test(userId)) {
        return interaction.reply({
          content: 'User ID không hợp lệ. ID phải gồm 17–20 chữ số.',
          flags: MessageFlags.Ephemeral
        });
      }

      // 7. Không cho phép dùng /unban với chính bot.
      if (userId === interaction.client.user.id) {
        return interaction.reply({
          content: 'Không thể sử dụng /unban với chính bot.',
          flags: MessageFlags.Ephemeral
        });
      }

      // 8. Báo Discord rằng bot đang xử lý lệnh.
      await interaction.deferReply({
        flags: MessageFlags.Ephemeral
      });

      // 9. Kiểm tra người dùng có đang bị ban không.
      let banEntry;

      try {
        banEntry = await guild.bans.fetch(userId);
      } catch (error) {
        // Discord API error 10026: Unknown Ban.
        if (error.code === 10026) {
          return interaction.editReply({
            content: 'Người dùng này hiện không bị ban trong server.'
          });
        }

        throw error;
      }

      // 10. Gỡ ban trực tiếp, không cần banManager.js.
      await guild.bans.remove(
        userId,
        `Unban bởi ${interaction.user.tag}: ${reason}`.slice(0, 500)
      );

      // 11. Thông báo kết quả.
      return interaction.editReply({
        content:
          `Đã gỡ ban thành công cho **${banEntry.user.tag}** ` +
          `(\`${userId}\`).\n` +
          `**Người thực hiện:** ${interaction.user}\n` +
          `**Lý do:** ${reason}`
      });
    } catch (error) {
      console.error('Lỗi khi thực hiện /unban:', error);

      const reply = {
        content: 'Không thể gỡ ban. Hãy kiểm tra quyền của bot và log lỗi.'
      };

      if (interaction.deferred || interaction.replied) {
        return interaction.editReply(reply);
      }

      return interaction.reply({
        ...reply,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};