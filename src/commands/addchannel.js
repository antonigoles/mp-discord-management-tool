const { SlashCommandBuilder } = require('@discordjs/builders');
const Utils = require('../utils.js')
const { databaseManager } = require("../database/databaseManager.js")

const COMMAND_NAME  =   "addchannel";
const DESCRIPTION   =   "Adds a channel to a group";

const registerHandler = (client) => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        if ( interaction.commandName === COMMAND_NAME ) {
            const groupName = (await interaction.options.getRole("group_name")).name.slice(7)
            const channelName = Utils.normalizeGroupName(interaction.options.getString("channel_name"))
            const categoryChannel = interaction.options.getChannel("category_name")
            const channelType = await interaction.options.getString("channel_type")
            const addGroupnamePrefix = await interaction.options.getBoolean("add_groupname_prefix")

            if ( !(await interaction.member.permissions.has("ADMINISTRATOR", true))
                &&!(interaction.member.roles.cache.some(role => role.name === `Grupa: ${groupName}`))
            ) {
                interaction.reply({content: "Nie jesteś Nauczycielem tej grupy!"})
                return;
            }

            if ( !await databaseManager.isGuildSettedUp( interaction.guild.id ) ) {
                interaction.reply({content: `😣 Serwer jeszcze nie jest gotowy, ${ "`/setup`"} by zsetupować`});
                return;
            }

            let categoryChannelName = categoryChannel.name;
            let isCategory = false
            await interaction.guild.channels.fetch().then( channels => {
                channels.map( channel => {
                    if ( channel.type == 'GUILD_CATEGORY' && channel.name == categoryChannelName ) {
                        isCategory = true;
                    }
                })
            })

            if ( !isCategory ) {
                interaction.reply({content: `😣 Ta kategoria nie istnieje!!`})
                return;
            }
            
            const allRoles = (await interaction.guild.roles.fetch())     

            const studentRole =         [ ...allRoles.filter( r => r.name == `Uczen: ${groupName}` ) ][0][1];
            const globalTeacherRole =   [ ...allRoles.filter( r => r.name == `Nauczyciel` )][0][1];
            const teacherRole =         [ ...allRoles.filter( r => r.name == `Nauczyciel: ${groupName}` )][0][1];

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

            const channelPrefix = addGroupnamePrefix ? `${groupName}-` : ``;

            let createdChannel;
            if ( channelType === "voice" ) {
                createdChannel = await interaction.guild.channels.create(`${channelPrefix}${channelName}`, {
                    type: 'GUILD_VOICE',
                    permissionOverwrites: permissionOverwrites, 
                })
            }
            else {
                createdChannel = await interaction.guild.channels.create(`${channelPrefix}${channelName}`, {
                    type: 'GUILD_TEXT',
                    permissionOverwrites: permissionOverwrites, 
                })
            } 

            await createdChannel.setParent(categoryChannel.id, { lockPermissions: true })
            await databaseManager.addChannelsToGroup( interaction.guild.id, groupName, [createdChannel.id] );

            interaction.reply({content: `😋 Dodano nowy kanał o nazwie \`${channelName}\` `})

        }
    });
}


exports.command = new SlashCommandBuilder()
                    .setName(COMMAND_NAME)
                    .setDescription(DESCRIPTION)
                    .addStringOption( option => 
                        option.setName("channel_type")
                            .addChoices([ ["voice", "voice"], [ "text", "text"] ])
                            .setDescription("Channel type")
                            .setRequired(true)
                    )
                    .addRoleOption( option =>
                        option.setName("group_name")
                            .setDescription("The name of the group")
                            .setRequired(true)
                    )
                    .addStringOption( option => 
                        option.setName("channel_name")
                            .setDescription("The name of the channel")
                            .setRequired(true)
                    )
                    .addChannelOption( option => 
                        option.setName("category_name")
                            .setDescription("The category of the channel")
                            .setRequired(true)
                    )
                    .addBooleanOption( option => 
                        option.setName("add_groupname_prefix")
                            .setDescription("If set to true, ${groupname}- prefix is added to the channel name")
                            .setRequired(true)
                    )

exports.registerHandler = registerHandler