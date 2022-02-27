const { SlashCommandBuilder } = require("@discordjs/builders");
const { databaseManager } = require("../database/databaseManager.js");
const Utils = require("../utils.js");

const COMMAND_NAME = "reset";
const DESCRIPTION = "Resets everything";

const reset = async (interaction) => {
    // command stuff
    const member = interaction.member;
    if (!(await Utils.isAdmin(member))) {
        interaction.reply({ content: "Nie masz permisji" });
        return;
    }

    if (!(await databaseManager.isGuildSettedUp(interaction.guild.id))) {
        interaction.reply({
            content: `😣 Serwer jeszcze nie jest zsetupowany, ${"`/setup`"} by zsetupować`,
        });
        return;
    }

    interaction.reply({ content: `❗ Resetowanie...` });
    if (interaction.options.getSubcommand() === "full") {
        await databaseManager.setGuildSetupStatus(interaction.guild.id, false);
        await interaction.guild.roles.fetch().then((roles) => {
            roles.map((role) => {
                const r_name = role.name;
                if (
                    Utils.includesAny(r_name, [
                        "Grupa: ",
                        "Admin",
                        "Uczen",
                        "Nauczyciel",
                        "Gosc",
                    ])
                )
                    interaction.guild.roles.delete(role.id, "setup reset");
            });
        });
    } else {
        await interaction.guild.roles.fetch().then((roles) => {
            roles.map((role) => {
                const r_name = role.name;
                if (
                    Utils.includesAny(r_name, [
                        "Grupa: ",
                        "- Admin",
                        "- Uczen",
                        "- Nauczyciel",
                        "- Gosc",
                    ])
                )
                    interaction.guild.roles.delete(role.id, "group reset");
            });
        });
    }

    databaseManager
        .getAllGroupsFromGuild(interaction.guild.id)
        .then((groups) => {
            groups.map((group) => {
                group.channels.map((channelId) => {
                    interaction.guild.channels
                        .fetch(channelId)
                        .then((channel) => {
                            channel.delete();
                        });
                });
                databaseManager.deleteGroup(interaction.guild.id, group.name);
            });
        });
};

exports.command = new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION)
    .addSubcommand((subcommand) =>
        subcommand.setName("full").setDescription("Resets everything")
    )
    .addSubcommand((subcommand) =>
        subcommand.setName("groups").setDescription("Resets groups only")
    );

exports.commandName = COMMAND_NAME;
exports.handlers = [{ type: "APPLICATION_COMMAND", func: reset }];
