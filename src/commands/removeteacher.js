const { SlashCommandBuilder } = require("@discordjs/builders");
const { databaseManager } = require("../database/databaseManager.js");
const Utils = require("../utils.js");

const COMMAND_NAME = "removeteacher";
const DESCRIPTION = "Removes teacher from group";

const removeTeacher = async (interaction) => {
    if (!interaction.isCommand()) return;
    if (!(interaction.commandName === COMMAND_NAME)) return;

    const member = interaction.member;
    const groupName = Utils.getGroupName(interaction);

    if (!(await Utils.isAdmin(member))) {
        interaction.reply({ content: "Nie masz permisji!" });
        return;
    }

    if (!(await databaseManager.isGroupInDb(interaction.guild.id, groupName))) {
        interaction.reply({ content: "😨 Taka grupa nie istnieje" });
        return;
    }

    try {
        const teacherUser = interaction.options.getUser("discord_user");
        if (
            !(await databaseManager.isTeacherInGroup(
                interaction.guild.id,
                groupName,
                teacherUser.id
            ))
        ) {
            interaction.reply({
                content: `😟 Nauczyciel nie jest w ${"`" + groupName + "`"}`,
            });
            return;
        }
        await databaseManager.removeTeacherFromGroup(
            groupName,
            interaction.guild.id,
            teacherUser.id
        );

        const teacherMember = await interaction.guild.members.cache.find(
            (m) => m.id === teacherUser.id
        );

        const groupTeacherRole = await interaction.guild.roles.cache.find(
            (role) => role.name === groupName + " - Nauczyciel"
        );

        await teacherMember.roles.remove(groupTeacherRole);

        interaction.reply({
            content: `😤 Usunięto nauczyciela z ${"`" + groupName + "`"}`,
        });
    } catch (err) {
        interaction.reply({ content: "😨 wystąpił błąd po stronie serwera" });
        console.log(err);
    }
};

exports.command = new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addRoleOption((option) =>
        option
            .setName("group_name")
            .setDescription("The name of the group")
            .setRequired(true)
    )
    .addUserOption((option) =>
        option
            .setName("discord_user")
            .setDescription("The @ of the teacher you want to remove")
            .setRequired(true)
    );

exports.commandName = COMMAND_NAME;
exports.handlers = [{ type: "command", func: removeTeacher }];
