const { SlashCommandBuilder } = require("@discordjs/builders");
const { databaseManager } = require("../database/databaseManager.js");
const Utils = require("../utils.js");

const COMMAND_NAME = "setup";
const DESCRIPTION = "Basic setup";

const setup = async (interaction) => {
    // command stuff
    const member = interaction.member;

    if (!(await Utils.isAdmin(member))) {
        interaction.reply({ content: "Nie masz permisji" });
        return;
    }
    if (await databaseManager.isGuildSettedUp(interaction.guild.id)) {
        interaction.reply({ content: `😣 Serwer jest już skonfigurowany` });
        return;
    }
    await databaseManager.setGuildSetupStatus(interaction.guild.id, true);

    interaction.guild.roles.create({
        name: `Admin`,
        color: "RED",
        permissions: "ADMINISTRATOR",
        hoist: true,
    });

    interaction.guild.roles.create({
        name: `Nauczyciel`,
        color: "YELLOW",
        hoist: true,
    });

    interaction.guild.roles.create({
        name: `Uczen`,
        color: "BLUE",
        hoist: true,
    });

    interaction.guild.roles
        .create({
            name: `Gosc`,
            color: "WHITE",
            hoist: true,
        })
        .then((guestRank) => {
            interaction.guild.members.fetch().then((members) => {
                members.map((member) => {
                    member.roles.add(guestRank);
                });
            });
        });

    interaction.reply({
        content: `👉 Dodano rangi: ${"`Admin, Nauczyciel, Uczen, Gosc`"}`,
    });
};

exports.command = new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(DESCRIPTION);

exports.commandName = COMMAND_NAME;
exports.handlers = [{ type: "APPLICATION_COMMAND", func: setup }];
