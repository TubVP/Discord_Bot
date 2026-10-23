
const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require('discord.js');

const MODERATOR_ROLE_ID = '1562543318389227540';
const STAFF_ROLE_ID = '1562542401053270076';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Cấm một thành viên khỏi server vô thời hạn')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Thành viên cần ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Lý do ban')
                .setMaxLength(400)
                .setRequired(false)
        ),

    async execute(interaction, client) {
        if (!interaction.inGuild()) {
            return interaction.reply({
                content: 'Lệnh này chỉ dùng trong server.',
                flags: MessageFlags.Ephemeral
            });
        }

        const guild = interaction.guild;
        const targetUser = interaction.options.getUser('user');
        const reason =
            interaction.options.getString('reason') || 'Không cung cấp lý do';

        try {
            const actor = await guild.members.fetch(interaction.user.id);
            const botMember = await guild.members.fetchMe();

            const isOwner = interaction.user.id === guild.ownerId;
            const hasAllowedRole =
                actor.roles.cache.has(MODERATOR_ROLE_ID) ||
                actor.roles.cache.has(STAFF_ROLE_ID);

            if (!isOwner && !hasAllowedRole) {
                return interaction.reply({
                    content: 'Bạn không có quyền sử dụng lệnh này.',
                    flags: MessageFlags.Ephemeral
                });
            }

            if (!botMember.permissions.has(PermissionFlagsBits.BanMembers)) {
                return interaction.reply({
                    content: 'Bot chưa được cấp quyền Ban Members.',
                    flags: MessageFlags.Ephemeral
                });
            }

            if (targetUser.id === interaction.user.id) {
                return interaction.reply({
                    content: 'Bạn không thể tự ban chính mình.',
                    flags: MessageFlags.Ephemeral
                });
            }

            if (targetUser.id === client.user.id) {
                return interaction.reply({
                    content: 'Bot không thể tự ban chính mình.',
                    flags: MessageFlags.Ephemeral
                });
            }

            if (targetUser.id === guild.ownerId) {
                return interaction.reply({
                    content: 'Không thể ban chủ sở hữu server.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const targetMember = await guild.members
                .fetch(targetUser.id)
                .catch(() => null);

            if (!targetMember) {
                return interaction.reply({
                    content: 'Thành viên này không có trong server nên không thể kiểm tra thứ bậc role.',
                    flags: MessageFlags.Ephemeral
                });
            }

            if (
                !isOwner &&
                targetMember.roles.highest.comparePositionTo(actor.roles.highest) >= 0
            ) {
                return interaction.reply({
                    content: 'Bạn không thể ban thành viên có role cao hơn hoặc bằng role cao nhất của bạn.',
                    flags: MessageFlags.Ephemeral
                });
            }

            if (!targetMember.bannable) {
                return interaction.reply({
                    content: 'Bot không thể ban thành viên này. Hãy kiểm tra thứ bậc role của bot.',
                    flags: MessageFlags.Ephemeral
                });
            }

            await interaction.deferReply({
                flags: MessageFlags.Ephemeral
            });

            await guild.members.ban(targetUser.id, {
                reason: `${reason} | Người thực hiện: ${interaction.user.tag}`
            });

            return interaction.editReply({
                content:
                    `Đã ban vô thời hạn **${targetUser.tag}** (\`${targetUser.id}\`).\n` +
                    `**Lý do:** ${reason}`
            });
        } catch (error) {
            console.error('Lỗi lệnh /ban:', error);

            const reply = {
                content: 'Đã xảy ra lỗi khi ban thành viên. Hãy kiểm tra log của bot.'
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
