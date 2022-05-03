const { SlashCommandBuilder } = require('@discordjs/builders');
const { databaseManager } = require("../database/databaseManager.js")
const { includesAny } = require("../utils.js")

const COMMAND_NAME  =   "removegroup";
const DESCRIPTION   =   "Removes group";

const registerHandler = (client) => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        if ( interaction.commandName === COMMAND_NAME ) {
            // command stuff
            const groupName = (await interaction.options.getRole("group_name")).name.slice(7)

            if ( !(await interaction.member.permissions.has("ADMINISTRATOR", true))
                &&!(interaction.member.roles.cache.some(role => role.name === `Nauczyciel: ${groupName}`))
            ) {
                interaction.reply({content: "Nie jesteś Nauczycielem tej grupy!"})
                return;
            }

            interaction.reply({content: `❗ Usuwanie grupy ${groupName}...`});
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
                            interaction.guild.roles.delete( role.id, "group reset")
                    })
                })

            const group = await databaseManager.getGroupByName( interaction.guild.id, groupName )
            await group.channels.map( channelId => {
                interaction.guild.channels.fetch(channelId).then( channel => {
                    channel.delete()
                })
            })
            await databaseManager.deleteGroup( interaction.guild.id, groupName )
        }
    });
}


exports.command = new SlashCommandBuilder()
                    .setName(COMMAND_NAME)
                    .setDescription(DESCRIPTION)
                    .addRoleOption( option =>
                        option.setName("group_name")
                            .setDescription("The name of the group (as a role)")
                            .setRequired(true)
                    );



exports.registerHandler = registerHandler