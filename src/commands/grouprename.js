const { SlashCommandBuilder } = require('@discordjs/builders');
const Utils = require('../utils.js')
const { databaseManager } = require("../database/databaseManager.js")

const COMMAND_NAME  =   "grouprename";
const DESCRIPTION   =   "Renames a group";

const registerHandler = (client) => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        if ( interaction.commandName === COMMAND_NAME ) {
            // command stuff
            if ( !(await interaction.member.permissions.has("ADMINISTRATOR", true))) {
                interaction.reply({content: "Nie masz permisji"})
                return
            }

            const groupName = (await interaction.options.getRole("group_mention")).name.slice(7)
            const newGroupName = await interaction.options.getString("new_name")
            const renameChannels = await interaction.options.getBoolean("rename_channels")


            if ( !(await databaseManager.isGroupInDb( interaction.guild.id, groupName)) ) {
                interaction.reply({content: "😨 Taka grupa nie istnieje"})
                return;
            }

            if ( await databaseManager.isGroupInDb(interaction.guild.id, newGroupName) ) {
                interaction.reply({content: `😣 Ta nazwa jest już zajęta na tym serwerze!!`})
                return;
            }

            

            // 1. change name in database
            const modifiedGroup = await databaseManager.renameGroup( interaction.guild.id, groupName, newGroupName )
            console.log(modifiedGroup)

            // 2. update roles 
            
            // 2a) update group role
            // 2b) update teacher role
            // 2c) update student role 

            await interaction.guild.roles.fetch()
                .then( roles => {
                    roles.map( role => {
                        const r_name = role.name
                        if ( includesAny(r_name, [
                            `Grupa: ${groupName}`,
                            `Uczen: ${groupName}`,
                            `Nauczyciel: ${groupName}`,
                        ])
                        )
                            interaction.guild.roles.edit({ name: `${r_name.slice(0,-groupName.length)}${newGroupName}` })
                    })
                })
            
            
            // 3. rename channels 



            if ( renameChannels ) {

            }
            

            interaction.reply({content: `✅ Utworzono nową grupę o nazwie: ${ "`" + groupName + "`" }`});
            
        }
    });
}


exports.command = new SlashCommandBuilder()
                    .setName(COMMAND_NAME)
                    .setDescription(DESCRIPTION)
                    .addRoleOption( option => 
                        option.setName("group_mention")
                            .setDescription("The name of the group (must be unique)")
                            .setRequired(true)
                    )
                    .addStringOption( option => 
                        option.setName("new_name")
                            .setDescription("New group name")
                            .setRequired(true)
                    )
                    .addBooleanOption( option => 
                        option.setName("rename_channels")
                            .setDescription("Rename group channels")
                            .setRequired(true)
                    );

exports.registerHandler = registerHandler