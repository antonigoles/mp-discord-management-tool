const { SlashCommandBuilder } = require("@discordjs/builders");
const Utils = require("../utils.js");
const { databaseManager } = require("../database/databaseManager.js");
const { includesAny } = require("../utils.js");

const COMMAND_NAME = "removegroup";
const DESCRIPTION = "Removes group";

const registerHandler = (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    if (!(interaction.commandName === COMMAND_NAME)) return;
    // command stuff
    const groupName = await Utils.getGroupName(interaction);
    const member = interaction.member;

    if (
      !(await Utils.isAdmin(member)) &&
      !Utils.isGroupsTeacher(member, groupName)
    ) {
      interaction.reply({ content: "Nie jesteś Nauczycielem tej grupy!" });
      return;
    }

    interaction.reply({ content: `❗ Usuwanie grupy ${groupName}...` });
    await interaction.guild.roles.fetch().then((roles) => {
      roles.map((role) => {
        const r_name = role.name;
        if (
          includesAny(r_name, [
            "Grupa: " + groupName,
            groupName + " - Admin",
            groupName + " - Uczen",
            groupName + " - Nauczyciel",
            groupName + " - Gosc",
          ])
        )
          interaction.guild.roles.delete(role.id, "group reset");
      });
    });

    const group = await databaseManager.getGroupByName(
      interaction.guild.id,
      groupName
    );
    await group.channels.map((channelId) => {
      interaction.guild.channels.fetch(channelId).then((channel) => {
        channel.delete();
      });
    });
    await databaseManager.deleteGroup(interaction.guild.id, groupName);
  });
};

exports.command = new SlashCommandBuilder()
  .setName(COMMAND_NAME)
  .setDescription(DESCRIPTION)
  .addRoleOption((option) =>
    option
      .setName("group_name")
      .setDescription("The name of the group (as a role)")
      .setRequired(true)
  );

exports.registerHandler = registerHandler;
