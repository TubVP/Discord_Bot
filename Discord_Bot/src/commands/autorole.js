const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');

const { setGuildConfig } = require('../utils/guildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Cấu hình role tự động cho thành viên mới')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)

    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Chọn role tự động cấp')
        .addRoleOption(option =>
          option
            .setName('role')
            .setDescription('Role cấp cho thành viên mới')
            .setRequired(true)
        )
    )

    .addSubcommand(subcommand =>
      subcommand
        .setName('disable')
        .setDescription('Tắt Auto-role')
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: 'Lệnh này chỉ dùng trong server.',
        flags: MessageFlags.Ephemeral
      });
    }

    const botMember = interaction.guild.members.me;

    if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        content: 'Bot cần quyền Manage Roles.',
        flags: MessageFlags.Ephemeral
      });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'disable') {
      setGuildConfig(interaction.guildId, {
        autoRoleId: null
      });

      return interaction.reply({
        content: 'Đã tắt Auto-role cho server này.',
        flags: MessageFlags.Ephemeral
      });
    }

    const role = interaction.options.getRole('role');

    if (role.id === interaction.guildId || role.managed) {
      return interaction.reply({
        content: 'Không thể chọn role này làm Auto-role.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (!role.editable) {
      return interaction.reply({
        content: 'Role phải nằm dưới role cao nhất của bot.',
        flags: MessageFlags.Ephemeral
      });
    }

    setGuildConfig(interaction.guildId, {
      autoRoleId: role.id
    });

    return interaction.reply({
      content: `Đã đặt Auto-role thành **${role.name}**.`,
      flags: MessageFlags.Ephemeral
    });
  }
};