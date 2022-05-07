const { databaseManager } = require("../database/databaseManager.js")
const Utils = require("../utils.js")
const { SlashCommandBuilder } = require('@discordjs/builders');

const COMMAND_NAME  =   "removekickedmembers";
const DESCRIPTION   =   "Removes group members that left the server";

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

            // O(n^2) algorithm, might comeback to this someday

            const group = await databaseManager.getGroupByName( interaction.guild.id, groupName )
            const allServerMembers = (await interaction.guild.members.fetch()).map( m => m.id )
            
            let removedCounter=0;

            group.teachers.forEach( teacher => {
                if ( !Utils.includesAny( teacher, allServerMembers ) ) {
                    databaseManager.removeTeacherFromGroup(groupName, interaction.guild.id, teacher)
                    removedCounter++;
                }
            })

            group.students.forEach( student => {
                if ( !Utils.includesAny( student, allServerMembers ) ) {
                    databaseManager.removeStudentFromGroup(groupName, interaction.guild.id, student)
                    removedCounter++;
                }
            })

            interaction.reply({content: `🥺 Usunięto ${ "`"+ removedCounter + "`" } członków grupy, których nie ma aktualnie na serwerze`})
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

exports.registerHandler = registerHandler