const { SlashCommandBuilder } = require('@discordjs/builders');
const { databaseManager } = require("../database/databaseManager.js")

const COMMAND_NAME  =   "addstudents";
const DESCRIPTION   =   "Adds multiple students at once (min 1 - max 6)";

const registerHandler = async (client) => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        if ( interaction.commandName === COMMAND_NAME ) {

            const groupName = (await interaction.options.getRole("group_name")).name.slice(7)

            if ( !(await interaction.member.permissions.has("ADMINISTRATOR", true))
                &&!(interaction.member.roles.cache.some(role => role.name ===  `Nauczyciel: ${groupName}`))
            ) {
                interaction.reply({content: "Nie jesteś Nauczycielem tej grupy!"})
                return;
            }

            if ( !(await databaseManager.isGroupInDb( interaction.guild.id, groupName)) ) {
                interaction.reply({content: "😨 Taka grupa nie istnieje"})
                return;
            }

            const futureStudents = []
            for( let i = 1; i<7; i++ ) {
                if ( interaction.options.getUser(`discord_user${i}`) != null ) {
                    futureStudents.push( interaction.options.getUser(`discord_user${i}`) )
                }
            }

            interaction.reply({
                content: `🥰 Dodano uczniów do grupy ${"`" + groupName + "`"}`
            })

            try {
                futureStudents.map(async (futureStudent) => {
                    const groupStudentRole = await interaction.guild.roles.cache
                        .find(role => role.name === `Uczen: ${groupName}`)

                    await databaseManager.addStudentToGroup(groupName, interaction.guild.id, futureStudent.id).then(() => {
                        interaction.guild.roles.fetch().then(roles => {
                            interaction.guild.members.fetch(futureStudent.id).then(member => {
                                roles.map(role => {
                                    if (role.name === `Uczen: ${groupName}` || role.name === "Uczen")
                                        member.roles.add(role)
                                })
                            })

                        })
                    })
                })
            } catch ( err ) {
                interaction.reply({content: "😨 wystąpił błąd po stronie serwera"})
                console.log(err)
            }

        }
    });
}


exports.command = new SlashCommandBuilder()
                    .setName(COMMAND_NAME)
                    .setDescription(DESCRIPTION)
                    .addRoleOption( option =>
                        option.setName("group_name")
                            .setDescription("The name of the group (must be unique)")
                            .setRequired(true)
                    )
                    .addUserOption( option =>
                        option.setName("discord_user1")
                            .setDescription("The @ of the user you want to assign as a student")
                            .setRequired(true)
                    )
                    .addUserOption( option =>
                        option.setName("discord_user2")
                            .setDescription("The @ of the user you want to assign as a student")
                            .setRequired(false)
                    )
                    .addUserOption( option =>
                        option.setName("discord_user3")
                            .setDescription("The @ of the user you want to assign as a student")
                            .setRequired(false)
                    )
                    .addUserOption( option =>
                        option.setName("discord_user4")
                            .setDescription("The @ of the user you want to assign as a student")
                            .setRequired(false)
                    )
                    .addUserOption( option =>
                        option.setName("discord_user5")
                            .setDescription("The @ of the user you want to assign as a student")
                            .setRequired(false)
                    )
                    .addUserOption( option =>
                        option.setName("discord_user6")
                            .setDescription("The @ of the user you want to assign as a student")
                            .setRequired(false)
                    )

exports.registerHandler = registerHandler