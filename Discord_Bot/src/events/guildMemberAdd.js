
const {
  Events,
  PermissionFlagsBits
} = require('discord.js');

const { getGuildConfig } = require('../utils/guildConfig');

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(member, client) {
    // =====================================
    // 1. AUTO-ROLE
    // =====================================
    try {
      const config = getGuildConfig(member.guild.id);
      const roleId = config.autoRoleId;

      // Server chưa cấu hình Auto-role
      if (roleId) {
        const role = await member.guild.roles.fetch(roleId);
        const botMember = member.guild.members.me;

        if (
          role &&
          role.id !== member.guild.id &&
          !role.managed &&
          botMember?.permissions.has(PermissionFlagsBits.ManageRoles) &&
          role.editable
        ) {
          await member.roles.add(role, 'Auto-role for new member');

          console.log(
            `Đã cấp role ${role.name} cho ${member.user.tag}`
          );
        } else {
          console.warn(
            `Không thể cấp Auto-role cho ${member.user.tag}. ` +
            'Hãy kiểm tra role và quyền của bot.'
          );
        }
      }
    } catch (error) {
      console.error('Không thể cấp Auto-role:', error);
    }

    // =====================================
    // 2. WELCOME MESSAGE
    // =====================================
    const channelId = process.env.WELCOME_CHANNEL_ID;

    if (!channelId) {
      console.warn('Chưa cấu hình WELCOME_CHANNEL_ID.');
      return;
    }

    try {
      const channel = await client.channels.fetch(channelId);

      if (!channel || !channel.isTextBased() || !channel.send) {
        console.warn('Kênh welcome không hợp lệ.');
        return;
      }

      await channel.send(
        `Chào mừng ${member} đến với **${member.guild.name}**! 👋\n` +
        `Chúc bạn có những trải nghiệm tuyệt vời tại đây!`
      );
    } catch (error) {
      console.error('Không thể gửi tin nhắn welcome:', error);
    }
  }
};
