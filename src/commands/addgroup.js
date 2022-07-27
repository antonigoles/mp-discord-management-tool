const { SlashCommandBuilder } = require('@discordjs/builders');
const Utils = require('../utils.js')
const { databaseManager } = require("../database/databaseManager.js")

const COMMAND_NAME  =   "addgroup";
const DESCRIPTION   =   "Adds a group";

const registerHandler = (client) => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        if ( interaction.commandName === COMMAND_NAME ) {
            // command stuff
            if ( !(await interaction.member.permissions.has("ADMINISTRATOR", true))) {
                interaction.reply({content: "Nie masz permisji"})
                return
            }

            if ( !await databaseManager.isGuildSettedUp( interaction.guild.id ) ) {
                interaction.reply({content: `😣 Serwer jeszcze nie jest gotowy, ${ "`/setup`"} by zsetupować`});
                return;
            }

            const groupName = Utils.normalizeGroupName(interaction.options.getString("group_name"))

            if ( await databaseManager.isGroupInDb(interaction.guild.id, groupName) ) {
                interaction.reply({content: `😣 Ta grupa już istnieje!!`})
                return;
            }

            interaction.reply({content: `✅ Utworzono nową grupę o nazwie: ${ "`" + groupName + "`" }`});
            await (async () => {
                const studentRole = await interaction.guild.roles.create({
                    name: `Uczen: ${groupName}`,
                    color: 'BLUE',
                })
                const teacherRole = await interaction.guild.roles.create({
                    name: `Nauczyciel: ${groupName}`,
                    color: 'YELLOW',
                })

                const globalTeacherRole = await interaction.guild.roles.cache
                    .find(role => role.name === "Nauczyciel" )

                const permissionOverwrites = [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                    },
                    {
                        id: studentRole.id,
                        allow: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                    },
                    {
                        id: globalTeacherRole.id,
                        allow: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                    },
                    {
                        id: teacherRole.id,
                        allow: [ 
                            'VIEW_CHANNEL', 'CONNECT', 'SPEAK', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 
                            'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'MANAGE_MESSAGES'
                        ],
                    }
                ]

                const categoryChannel = await interaction.guild.channels.create(`${groupName}`, {
                    type: 'GUILD_CATEGORY',
                    permissionOverwrites: permissionOverwrites,
                })

                const voiceChannel = await interaction.guild.channels.create(`${groupName}-voice`, {
                    type: 'GUILD_VOICE',
                    permissionOverwrites: permissionOverwrites, 
                })
                
                const textChannel = await interaction.guild.channels.create(`${groupName}-general`, {
                    type: 'GUILD_TEXT',
                    permissionOverwrites: permissionOverwrites,
                })
                
                

                await voiceChannel.setParent(categoryChannel.id, { lockPermissions: true })
                await textChannel.setParent(categoryChannel.id, { lockPermissions: true })

                await databaseManager.createGroup(
                    interaction.guild.id,
                    groupName,
                    [ voiceChannel.id, textChannel.id, categoryChannel.id ]
                )
            })();
        }
    });
}


exports.command = new SlashCommandBuilder()
                    .setName(COMMAND_NAME)
                    .setDescription(DESCRIPTION)
                    .addStringOption( option => 
                        option.setName("group_name")
                            .setDescription("The name of the group (must be unique)")
                            .setRequired(true)
                    )

exports.registerHandler = registerHandler