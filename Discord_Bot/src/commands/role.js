
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Quản lý role thành viên')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)

    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Cấp role cho thành viên')
        .addUserOption(option =>
          option
            .setName('member')
            .setDescription('Thành viên cần cấp role')
            .setRequired(true)
        )
        .addRoleOption(option =>
          option
            .setName('role')
            .setDescription('Role cần cấp')
            .setRequired(true)
        )
    )

    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Thu hồi role của thành viên')
        .addUserOption(option =>
          option
            .setName('member')
            .setDescription('Thành viên cần thu hồi role')
            .setRequired(true)
        )
        .addRoleOption(option =>
          option
            .setName('role')
            .setDescription('Role cần thu hồi')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: 'Lệnh này chỉ dùng trong server.',
        flags: MessageFlags.Ephemeral
      });
    }

    // Kiểm tra quyền của người gọi lệnh
    if (!interaction.memberPermissions.has(
      PermissionFlagsBits.ManageRoles
    )) {
      return interaction.reply({
        content: 'Bro cần quyền Manage Roles để dùng lệnh này.',
        flags: MessageFlags.Ephemeral
      });
    }

    const botMember = interaction.guild.members.me;

    // Kiểm tra quyền của bot
    if (!botMember.permissions.has(
      PermissionFlagsBits.ManageRoles
    )) {
      return interaction.reply({
        content: 'Bot chưa được cấp quyền Manage Roles.',
        flags: MessageFlags.Ephemeral
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser('member');
    const role = interaction.options.getRole('role');

    // Không cho phép thao tác với @everyone hoặc role do tích hợp quản lý
    if (role.id === interaction.guild.id || role.managed) {
      return interaction.reply({
        content: 'Không thể quản lý role này bằng lệnh trên.',
        flags: MessageFlags.Ephemeral
      });
    }

    // Bot chỉ có thể quản lý role thấp hơn role cao nhất của nó
    if (!role.editable) {
      return interaction.reply({
        content: 'Role này cao hơn quyền quản lý của bot hoặc không thể chỉnh sửa.',
        flags: MessageFlags.Ephemeral
      });
    }

    const member = await interaction.guild.members
      .fetch(user.id)
      .catch(() => null);

    if (!member) {
      return interaction.reply({
        content: 'Không tìm thấy thành viên trong server.',
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      if (subcommand === 'add') {
        if (member.roles.cache.has(role.id)) {
          return interaction.reply({
            content: `${member.user.tag} đã có role ${role.name}.`,
            flags: MessageFlags.Ephemeral
          });
        }

        await member.roles.add(role, `Được cấp bởi ${interaction.user.tag}`);

        return interaction.reply({
          content: `Đã cấp role **${role.name}** cho ${member}.`,
          flags: MessageFlags.Ephemeral
        });
      }

      if (subcommand === 'remove') {
        if (!member.roles.cache.has(role.id)) {
          return interaction.reply({
            content: `${member.user.tag} chưa có role ${role.name}.`,
            flags: MessageFlags.Ephemeral
          });
        }

        await member.roles.remove(
          role,
          `Được thu hồi bởi ${interaction.user.tag}`
        );

        return interaction.reply({
          content: `Đã thu hồi role **${role.name}** khỏi ${member}.`,
          flags: MessageFlags.Ephemeral
        });
      }
    } catch (error) {
      console.error('Lỗi quản lý role:', error);

      if (!interaction.replied) {
        await interaction.reply({
          content: 'Không thể cập nhật role. Hãy kiểm tra quyền và thứ bậc role.',
          flags: MessageFlags.Ephemeral
        }).catch(console.error);
      }
    }
  }
};
