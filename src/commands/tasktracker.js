const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { databaseManager, Errors } = require('../database/databaseManager.js');
const Utils = require('../utils.js')
const { env } = require("../config.js")


const COMMAND_NAME  =   "tasktracker";
const DESCRIPTION   =   "Creates task tracker for students";

const command_temporary_memory = {}

const registerHandler = async (client) => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        if ( interaction.commandName === COMMAND_NAME ) {

            const groupName = (await interaction.options.getRole("group_name")).name.slice(7)

            if ( !(await interaction.member.permissions.has("ADMINISTRATOR", true))
                &&!(interaction.member.roles.cache.some(role => role.name === `Nauczyciel: ${groupName}`))
            ) {
                interaction.reply({content: "Nie jesteś Nauczycielem tej grupy!"})
                return;
            }

            if ( !(await databaseManager.isGroupInDb( interaction.guild.id, groupName)) ) {
                interaction.reply({content: "😨 Taka grupa nie istnieje"})
                return;
            }

            const groupData = await databaseManager.getGroupByName( interaction.guild.id, groupName )

            if ( groupData.students.length <= 0 ) {
                interaction.reply({
                    content: "**Wygląda na to że w tej grupie nie ma jeszcze uczniów...**\nDodaj uczniów komendą: `/addstudents`"
                })
                return
            }

            const tasks = []
            for( let i = 1; i<=env.MAX_CMD_ARGUMENT_LIST_LENGTH; i++ ) {
                if ( interaction.options.getString(`task${i}`) != null ) {
                    tasks.push( interaction.options.getString(`task${i}`) )
                }
            }

            
   
            let groupedTasks = [ [] ]
            tasks.map( (e) => {
                if ( groupedTasks[groupedTasks.length-1].length >= 5 ) 
                    groupedTasks.push([]) 
                groupedTasks[groupedTasks.length-1].push(e)
            })

            const members = await interaction.guild.members.fetch() 
            
            let groupedStudents = [ [] ]
            groupData.students.map( (e) => {
                if ( groupedStudents[groupedStudents.length-1].length >= 4 )
                    groupedStudents.push([]) 
                groupedStudents[groupedStudents.length-1].push(e)
            })

            const emojis = await interaction.guild.emojis.fetch()
            const emojiMap = {}
            emojis.forEach( (emoji) => {
                emojiMap[ emoji.name ] = emoji;
            })

            const taskEmbed = new MessageEmbed()
                .setAuthor({ 
                    name: 'Zadanka', 
                    iconURL: 'https://www.seekpng.com/png/full/67-671514_learn-more-free-survey-icon.png' 
                })
                .setColor('#00ff00')
                .setTitle(
                    tasks.map( (e,idx) => {
                        return `\`${idx+1}) ${e}\``
                    }).join("\n") 
                )
                .addFields( [
                    ...groupedStudents.map( studentGroup => {
                        return { 
                            name: `\`Osoba${Utils.setLengthString("",10+Math.floor(3.3*tasks.length))}Progress\``, 
                            value: studentGroup.map( ( studentId ) => {
                                    const mem = members.find( u => u.id == studentId )
                                    const nickname = mem != undefined ? mem.displayName : "UCZEŃ WYSZEDŁ Z SERWERA" 
                                    const parsedName = `${Utils.setLengthString(nickname, 21)}`
                                    return `\`${parsedName}: \`${tasks.map( (_,i) => emojiMap[`red${i+1}`] ).join(" ")}`
                                }).join("\n") 
                        } 
                    })               
                    ] 
                )
                .setFooter({
                    text: `do pracy :)`
                })

            const trackerId = Utils.getUID()     
            const buttonRows = groupedTasks.map( (taskGroup,gId) => {
                return new MessageActionRow()
                            .addComponents([
                                ...taskGroup.map( (_,i) => {
                                    return new MessageButton()
                                                .setCustomId(`progress-button-${(5*gId)+i+1}-${trackerId}`)
                                                .setLabel(`${(5*gId)+i+1}`)
                                                .setStyle('SUCCESS')
                                })
                            ]);
            })

            const interactionMessage = await interaction.reply({ 
                content: " ", 
                embeds: [ taskEmbed ], 
                fetchReply: true,  
                components: buttonRows
            })  
            await databaseManager.addTaskTrackerToDb( 
                tasks.length, 
                groupData.students,
                trackerId
            )
        }
    });

    // handle input select interaction
    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton() ) return;
        if ( !interaction.customId.includes("progress-button") ) return;

        // `progress-button-${i}-${gId}-${trackerId}`
        const buttonClickedData = interaction.customId.split("-")
        const taskId = buttonClickedData[2]
        const trackerId = buttonClickedData[3]
        let updatedTracker;
        try {
            updatedTracker = await databaseManager.updateAndReturnTaskTracker( 
                trackerId, interaction.user.id, taskId-1 
            )
        } catch(err) {
            Utils.logDebug( err )
            if ( err == Errors.NO_SUCH_USER_IN_COLLECTION ) {
                interaction.reply({ 
                    content: `Wygląda na to że nie należysz do tej grupy 😧`,
                    ephemeral: true,
                })
                return;
            } 
            interaction.reply({ 
                content: `**Wystąpił problem po stronie bazy danych :(**\nmożliwe że tracker już nie jest aktywny`,
                ephemeral: true,
            })
            return;
        }
        // redraw message
        const originalMessage = interaction.message

        const members = await interaction.guild.members.fetch() 

        const groupStudents = Object.keys(updatedTracker.progress);

        let groupedStudents = [ [] ]
        groupStudents.map( (e) => {
            if ( groupedStudents[groupedStudents.length-1].length >= 4 )
                groupedStudents.push([]) 
            groupedStudents[groupedStudents.length-1].push(e)
        })

        const emojis = await interaction.guild.emojis.fetch()
        const emojiMap = {}
        emojis.forEach( (emoji) => {
            emojiMap[ emoji.name ] = emoji;
        })
        originalMessage.embeds[0].setFields([
            ...groupedStudents.map( studentGroup => {
                return { 
                    name: `\`Osoba${Utils.setLengthString("",10+Math.floor(3.3*updatedTracker.taskCount))}Progress\``, 
                    value: studentGroup.map( ( studentId ) => {
                            const mem = members.find( u => u.id == studentId )
                            const nickname = mem != undefined ? mem.displayName : "UCZEŃ WYSZEDŁ Z SERWERA" 
                            const parsedName = `${Utils.setLengthString(nickname, 21)}`
                            return `\`${parsedName}: \`${
                                Object.keys(updatedTracker.progress[studentId]).map( 
                                    task => 
                                        updatedTracker.progress[studentId][task] ? 
                                        emojiMap[`green${Number(task)+1}`] :  emojiMap[`red${Number(task)+1}`]
                                ).join(" ")
                            }`
                        }).join("\n") 
                } 
            })               
        ])



        interaction.update( {
            content: " ",
            components: originalMessage.components,
            embeds: originalMessage.embeds,
            fetchReply: true,
        })

    })
}


exports.command = new SlashCommandBuilder()
                    .setName(COMMAND_NAME)
                    .setDescription(DESCRIPTION)
                    .addRoleOption( option =>
                        option.setName("group_name")
                            .setDescription("The name of the group (as a role)")
                            .setRequired(true)
                    )
                    .addStringOption( option => 
                        option.setName("task1")
                            .setDescription("task1")
                            .setRequired(true)
                    )
                    .addStringOption( option => 
                        option.setName("task2")
                            .setDescription("task2")
                            .setRequired(false)
                    )
                    .addStringOption( option => 
                        option.setName("task3")
                            .setDescription("task3")
                            .setRequired(false)
                    )

                    .addStringOption( option => 
                        option.setName("task4")
                            .setDescription("task4")
                            .setRequired(false)
                    )

                    .addStringOption( option => 
                        option.setName("task5")
                            .setDescription("task5")
                            .setRequired(false)
                    )

                    .addStringOption( option => 
                        option.setName("task6")
                            .setDescription("task6")
                            .setRequired(false)
                    )

                    .addStringOption( option => 
                        option.setName("task7")
                            .setDescription("task7")
                            .setRequired(false)
                    )

                    .addStringOption( option => 
                        option.setName("task8")
                            .setDescription("task8")
                            .setRequired(false)
                    )

                    .addStringOption( option => 
                        option.setName("task9")
                            .setDescription("task9")
                            .setRequired(false)
                    )

                    .addStringOption( option => 
                        option.setName("task10")
                            .setDescription("task10")
                            .setRequired(false)
                    )

                    .addStringOption( option => 
                        option.setName("task11")
                            .setDescription("task11")
                            .setRequired(false)
                    )

                    .addStringOption( option => 
                        option.setName("task12")
                            .setDescription("task12")
                            .setRequired(false)
                    )



exports.registerHandler = registerHandler