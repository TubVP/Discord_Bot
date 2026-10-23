
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');

// ID role Staff của server
const STAFF_ROLE_ID = '1562542401053270076';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Đuổi thành viên khỏi server')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Thành viên cần đuổi')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Lý do đuổi thành viên')
        .setRequired(false)
        .setMaxLength(400)
    ),

  async execute(interaction) {
    // 1. Chỉ chạy trong server
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: 'Lệnh này chỉ dùng trong server.',
        flags: MessageFlags.Ephemeral
      });
    }

    const guild = interaction.guild;

    // 2. Kiểm tra người gọi có phải Owner không
    const isOwner = interaction.user.id === guild.ownerId;

    // 3. Lấy thành viên gọi lệnh để kiểm tra role
    const actor = await guild.members
      .fetch(interaction.user.id)
      .catch(() => null);

    if (!actor) {
      return interaction.reply({
        content: 'Không thể xác minh thành viên thực hiện lệnh.',
        flags: MessageFlags.Ephemeral
      });
    }

    // 4. Kiểm tra người gọi có role Staff không
    const isStaff = actor.roles.cache.has(STAFF_ROLE_ID);

    // Chỉ Owner hoặc Staff được sử dụng /kick
    if (!isOwner && !isStaff) {
      return interaction.reply({
        content: 'Bạn cần là Owner hoặc có role Staff để sử dụng lệnh này.',
        flags: MessageFlags.Ephemeral
      });
    }

    // 5. Kiểm tra quyền kick của bot
    const botMember = guild.members.me;

    if (
      !botMember ||
      !botMember.permissions.has(PermissionFlagsBits.KickMembers)
    ) {
      return interaction.reply({
        content: 'Bot chưa có quyền Kick Members.',
        flags: MessageFlags.Ephemeral
      });
    }

    // 6. Lấy mục tiêu và lý do
    const user = interaction.options.getUser('user');

    const reason =
      interaction.options.getString('reason')?.trim() ||
      'Không cung cấp lý do';

    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: 'Bạn không thể tự kick chính mình.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (user.id === interaction.client.user.id) {
      return interaction.reply({
        content: 'Bot không thể tự kick chính mình.',
        flags: MessageFlags.Ephemeral
      });
    }

    // 7. Lấy GuildMember của mục tiêu
    const target = await guild.members
      .fetch(user.id)
      .catch(() => null);

    if (!target) {
      return interaction.reply({
        content: 'Không tìm thấy thành viên trong server.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (target.id === guild.ownerId) {
      return interaction.reply({
        content: 'Không thể kick Owner của server.',
        flags: MessageFlags.Ephemeral
      });
    }

    // 8. Staff không được kick thành viên có role
    // cao nhất ngang bằng hoặc cao hơn role cao nhất của mình.
    // Owner được bỏ qua kiểm tra này.
    if (
      !isOwner &&
      target.roles.highest.comparePositionTo(actor.roles.highest) >= 0
    ) {
      return interaction.reply({
        content:
          'Bạn không thể kick thành viên có role cao nhất ' +
          'ngang bằng hoặc cao hơn role của mình.',
        flags: MessageFlags.Ephemeral
      });
    }

    // 9. Kiểm tra bot có thể kick mục tiêu không
    if (!target.kickable) {
      return interaction.reply({
        content:
          'Bot không thể kick thành viên này. ' +
          'Hãy kiểm tra quyền và thứ bậc role của bot.',
        flags: MessageFlags.Ephemeral
      });
    }

    // 10. Thực hiện kick
    try {
      await target.kick(
        `Thực hiện bởi ${interaction.user.tag} | Lý do: ${reason}`
      );

      return interaction.reply({
        content:
          `Đã kick **${user.tag}** khỏi server.\n` +
          `**Người thực hiện:** ${interaction.user}\n` +
          `**Lý do:** ${reason}`,
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error('Lỗi khi thực hiện /kick:', error);

      return interaction.reply({
        content:
          'Không thể kick thành viên. ' +
          'Hãy kiểm tra quyền và thứ bậc role.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
