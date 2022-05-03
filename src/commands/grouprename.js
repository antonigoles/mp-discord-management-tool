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

            if ( !(await databaseManager.isGroupInDb( interaction.guild.id, groupName)) ) {
                interaction.reply({content: "😨 Taka grupa nie istnieje"})
                return;
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