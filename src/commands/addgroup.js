const { SlashCommandBuilder } = require("@discordjs/builders");
const { databaseManager } = require("../database/databaseManager.js");
const Utils = require("../utils.js");

const COMMAND_NAME = "addgroup";
const DESCRIPTION = "Adds a group";

const registerHandler = (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    if (!(interaction.commandName === COMMAND_NAME)) return;

    // command stuff
    const member = interaction.member;
    const groupName = await Utils.getGroupName(interaction);

    if (!(await Utils.isAdmin(member))) {
      interaction.reply({ content: "Nie masz permisji" });
      return;
    }

    if (!(await databaseManager.isGuildSettedUp(interaction.guild.id))) {
      interaction.reply({
        content: `😣 Serwer jeszcze nie jest gotowy, ${"`/setup`"} by zsetupować`,
      });
      return;
    }

    if (await databaseManager.isGroupInDb(interaction.guild.id, groupName)) {
      interaction.reply({ content: `😣 Ta grupa już istnieje!!` });
      return;
    }

    const categoryChannelName = interaction.options.getString("category_name");
    let categoryChannel = null;
    await interaction.guild.channels.fetch().then((channels) => {
      channels.map((channel) => {
        if (
          channel.type == "GUILD_CATEGORY" &&
          channel.name == categoryChannelName
        ) {
          categoryChannel = channel;
        }
      });
    });

    if (categoryChannel == null) {
      interaction.reply({ content: `😣 Ta kategoria nie istnieje!!` });
      return;
    }

    interaction.reply({
      content: `✅ Utworzono nową grupę o nazwie: ${"`" + groupName + "`"}`,
    });
    await (async () => {
      const mentionShortcut = await interaction.guild.roles.create({
        name: `Grupa: ${groupName}`,
        color: "GREEN",
      });

      const studentRole = await interaction.guild.roles.create({
        name: `${groupName} - Uczen`,
        color: "BLUE",
      });
      const teacherRole = await interaction.guild.roles.create({
        name: `${groupName} - Nauczyciel`,
        color: "YELLOW",
      });

      const globalTeacherRole = await interaction.guild.roles.cache.find(
        (role) => role.name === "Nauczyciel"
      );

      const permissionOverwrites = [
        {
          id: interaction.guild.roles.everyone.id,
          deny: [
            "VIEW_CHANNEL",
            "CONNECT",
            "SPEAK",
            "SEND_MESSAGES",
            "READ_MESSAGE_HISTORY",
          ],
        },
        {
          id: studentRole.id,
          allow: [
            "VIEW_CHANNEL",
            "CONNECT",
            "SPEAK",
            "SEND_MESSAGES",
            "READ_MESSAGE_HISTORY",
          ],
        },
        {
          id: globalTeacherRole.id,
          allow: [
            "VIEW_CHANNEL",
            "CONNECT",
            "SPEAK",
            "SEND_MESSAGES",
            "READ_MESSAGE_HISTORY",
          ],
        },
        {
          id: teacherRole.id,
          allow: [
            "VIEW_CHANNEL",
            "CONNECT",
            "SPEAK",
            "SEND_MESSAGES",
            "READ_MESSAGE_HISTORY",
            "MUTE_MEMBERS",
            "DEAFEN_MEMBERS",
            "MOVE_MEMBERS",
            "MANAGE_MESSAGES",
          ],
        },
      ];
      const voiceChannel = await interaction.guild.channels.create(
        `${groupName}-voice`,
        {
          type: "GUILD_VOICE",
          permissionOverwrites: permissionOverwrites,
        }
      );
      const textChannel = await interaction.guild.channels.create(
        `${groupName}-general`,
        {
          type: "GUILD_TEXT",
          permissionOverwrites: permissionOverwrites,
        }
      );

      await voiceChannel.setParent(categoryChannel.id, {
        lockPermissions: false,
      });
      await textChannel.setParent(categoryChannel.id, {
        lockPermissions: false,
      });

      await databaseManager.createGroup(interaction.guild.id, groupName, [
        voiceChannel.id,
        textChannel.id,
      ]);
    })();
  });
};

exports.command = new SlashCommandBuilder()
  .setName(COMMAND_NAME)
  .setDescription(DESCRIPTION)
  .addStringOption((option) =>
    option
      .setName("group_name")
      .setDescription("The name of the group (must be unique)")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("category_name")
      .setDescription("The category the channel")
      .setRequired(true)
  );

exports.registerHandler = registerHandler;
