const { databaseManager } = require("../database/databaseManager.js")
const { env } = require("../config.js")
const Utils = require("../utils.js")
const { SlashCommandBuilder } = require('@discordjs/builders');

const COMMAND_NAME  =   "removestudents";
const DESCRIPTION   =   "Removes multiple students at once";

const registerHandler = async (client) => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        if ( interaction.commandName === COMMAND_NAME ) {

            const groupName = (await interaction.options.getRole("group_name")).name.slice(7)

            if ( !(await interaction.member.permissions.has("ADMINISTRATOR", true))
                &&!(interaction.member.roles.cache.some(role => role.name === `Grupa: ${groupName}`))
            ) {
                interaction.reply({content: "Nie jesteś Nauczycielem tej grupy!"})
                return;
            }

            if ( !(await databaseManager.isGroupInDb( interaction.guild.id, groupName)) ) {
                interaction.reply({content: "😨 Taka grupa nie istnieje"})
                return;
            }

            const futureStudents = []
            for( let i = 1; i<=env.MAX_CMD_ARGUMENT_LIST_LENGTH; i++ ) {
                if ( interaction.options.getUser(`discord_user${i}`) != null ) {
                    futureStudents.push( interaction.options.getUser(`discord_user${i}`) )
                }
            }

            let failedCounter = 0;
            try {
                for ( let i = 0; i<futureStudents.length; i++ ) {
                    const futureStudentUser = futureStudents[i]
                    if ( !(await databaseManager.isStudentInGroup( interaction.guild.id, groupName, futureStudentUser.id))) {
                        Utils.logDebug(`${futureStudentUser.id} is not in DB!!!`)
                        failedCounter++;
                        continue;
                    }
                    await databaseManager.removeStudentFromGroup( groupName, interaction.guild.id, futureStudentUser.id )

                    const groupStudentRole = await interaction.guild.roles.cache
                        .find(role => role.name === `Uczen: ${groupName}`)

                    const futureStudentMember = await interaction.guild.members.cache.find( m => m.id === futureStudentUser.id)
                    await futureStudentMember.roles.remove( groupStudentRole )

                    if ( !(futureStudentMember.roles.cache.some( role => role.name.includes("Uczen:") ) ) ) {
                        const studentRole = await interaction.guild.roles.cache
                            .find(role => role.name === "Uczen")
                        await futureStudentMember.roles.remove( studentRole )
                    }
                }
            } catch ( err ) {
                interaction.reply({content: "😨 wystąpił błąd po stronie serwera"})
                Utils.logDebug(err)
            }

            const successful = futureStudents.length - failedCounter
            if ( failedCounter > 0 ) {
                interaction.reply({
                    content: `😤 Usunięto **${successful} z ${futureStudents.length}** uczniów (pozostali nie byli w grupie) ${"`" + groupName + "`"}`
                })
            } else {
                interaction.reply({
                    content: `😤 Usunięto uczniów z ${"`" + groupName + "`"}`
                })
            }

        }
    });
}


exports.command = new SlashCommandBuilder()
                    .setName(COMMAND_NAME)
                    .setDescription(DESCRIPTION)
                    .addRoleOption( option =>
                        option.setName("group_name")
                            .setDescription("The name of the group")
                            .setRequired(true)
                    )
                    .addUserOption( option => 
                        option.setName("discord_user1")
                            .setDescription("discord_user1")
                            .setRequired(true)
                    )
                    .addUserOption( option => 
                        option.setName("discord_user2")
                            .setDescription("discord_user2")
                            .setRequired(false)
                    )
                    .addUserOption( option => 
                        option.setName("discord_user3")
                            .setDescription("discord_user3")
                            .setRequired(false)
                    )
                    .addUserOption( option => 
                        option.setName("discord_user4")
                            .setDescription("discord_user4")
                            .setRequired(false)
                    )
                    .addUserOption( option => 
                        option.setName("discord_user5")
                            .setDescription("discord_user5")
                            .setRequired(false)
                    )
                    .addUserOption( option => 
                        option.setName("discord_user6")
                            .setDescription("discord_user6")
                            .setRequired(false)
                    )
                    .addUserOption( option => 
                        option.setName("discord_user7")
                            .setDescription("discord_user7")
                            .setRequired(false)
                    )
                    .addUserOption( option => 
                        option.setName("discord_user8")
                            .setDescription("discord_user8")
                            .setRequired(false)
                    )
                    .addUserOption( option => 
                        option.setName("discord_user9")
                            .setDescription("discord_user9")
                            .setRequired(false)
                    )
                    .addUserOption( option => 
                        option.setName("discord_user10")
                            .setDescription("discord_user10")
                            .setRequired(false)
                    )

exports.registerHandler = registerHandler