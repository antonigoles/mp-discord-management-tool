const { SlashCommandBuilder } = require('@discordjs/builders');
const { databaseManager } = require("../database/databaseManager.js")

const COMMAND_NAME  =   "addteacher";
const DESCRIPTION   =   "Adds a teacher";

const registerHandler = async (client) => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        if ( interaction.commandName === COMMAND_NAME ) {
            // command stuff
            if ( !(await interaction.member.permissions.has("ADMINISTRATOR", true))) {
                interaction.reply({content: "Nie masz permisji"})
                return;
            }
            const groupName = (await interaction.options.getRole("group_name")).name.slice(7)
            const futureTeacher = interaction.options.getUser("discord_user")
            if ( !(await databaseManager.isGroupInDb( interaction.guild.id, groupName)) ) {
                interaction.reply({content: "😨 Taka grupa nie istnieje"})
                return;
            }
            try {
                await databaseManager.addTeacherToGroup(groupName, interaction.guild.id, futureTeacher.id).then( () => {
                    interaction.guild.roles.fetch().then( roles => {
                        interaction.guild.members.fetch(futureTeacher.id).then( member => {
                            roles.map( role => {
                                if ( role.name === groupName + " - Nauczyciel" || role.name === "Nauczyciel" )
                                    member.roles.add( role )
                            })
                        })

                    })
                })
                interaction.reply({
                    content: `🥰 Dodano ${"`" + futureTeacher.username + "`"} jako Nauczyciela grupy ${"`" + groupName + "`"}`
                })
            } catch (err) {
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
                        option.setName("discord_user")
                            .setDescription("The @ of the user you want to asign as a teacher")
                            .setRequired(true)
                    );

exports.registerHandler = registerHandler