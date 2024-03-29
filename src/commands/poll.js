const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { databaseManager } = require('../database/databaseManager.js');
const { env } = require("../config.js")
const { SlashCommandBuilder } = require('@discordjs/builders');


const COMMAND_NAME  =   "poll";
const DESCRIPTION   =   "Creates poll";

const registerHandler = async (client) => {
    const emojiTable = "🔴,🟠,🟡,🟢,🔵,🟣,🟤,⚫,⚪,🟥,🟧,🟨,🟩,🟦,🟪,🟫".split(",")
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        if ( interaction.commandName === COMMAND_NAME ) {

            if ( !(await interaction.member.permissions.has("ADMINISTRATOR", true))
                &&!(interaction.member.roles.cache.some(role => role.name ===  "Nauczyciel"))
            ) {
                interaction.reply({content: "Nie jesteś Nauczycielem!"})
                return;
            }

            const pollOptions = []
            for( let i = 1; i<=env.MAX_CMD_ARGUMENT_LIST_LENGTH; i++ ) {
                if ( interaction.options.getString(`option${i}`) != null ) {
                    pollOptions.push( interaction.options.getString(`option${i}`) )
                }
            }
            
            const title = interaction.options.getString('text')
            const pollEmbed = new MessageEmbed()
                .setAuthor({ 
                    name: 'Ankieta', 
                    iconURL: 'https://www.seekpng.com/png/full/67-671514_learn-more-free-survey-icon.png' 
                })
                .setColor('#ff1d00')
                .setTitle(title)
                .addFields( [
                    { 
                        name: `*Opcje:*`,
                        value: `${pollOptions.map( (opt,idx) => {
                            return `${emojiTable[idx]} - \`${opt}\``
                        }).join("\n")}`
                     }
                        
                    ] 
                )
                .setFooter({
                    text: `${ pollOptions.map( (opt,idx) => {
                        return `${emojiTable[idx]}: 0`
                    }).join(" ") }`
                })

            const pollId = Date.now().toString();
            
            await databaseManager.addPollToDb( pollId, pollOptions )
            

            const row = new MessageActionRow()
                .addComponents([
                    new MessageSelectMenu()
                        .setCustomId("select-poll-answer")
                        .setPlaceholder('Brak odpowiedzi')
                        .addOptions([
                            ...pollOptions.map( (opt,idx) => {
                                return { 
                                    label: `${emojiTable[idx]} ${opt}`, 
                                    description: `Opcja ${idx+1}`,
                                    value: `option-${idx+1}-${pollId}`
                                }  
                            })
                        ])
                ])

            const interactionMessage = await interaction.reply({ 
                content: " ", 
                embeds: [ pollEmbed ], 
                fetchReply: true,  
                components: [ row ] 
            })   
        }
    });

    // handle input select interaction
    client.on('interactionCreate', async interaction => {
        if (!interaction.isSelectMenu()) return;
        if ( interaction.customId != "select-poll-answer" ) return;

        const choice = interaction.values[0].split('-')
        const pollId = choice[2]
        const choiceid = Number(choice[1])

        const originalMessage = interaction.message


        // change vote
        await databaseManager.removeVoteFromPoll(pollId, interaction.user.id ),
        await databaseManager.addVoteToPoll(pollId, interaction.user.id, choiceid)
        
        const poll = await databaseManager.getPoll(pollId)

        const pollOptions = poll.pollOptions
    
        const newVoteResults = [...Array( pollOptions.length )].fill(0)
        poll.votes.forEach(vote => {
            newVoteResults[vote.choice-1] += 1
        })

        originalMessage.embeds[0].setFooter({
            text: `${ newVoteResults.map( (opt,idx) => 
                 `${emojiTable[idx]}: ${newVoteResults[idx]}`
            ).join(" ") }`
        })

        originalMessage.content = " "
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
                    .addStringOption( option =>
                        option.setName("text")
                            .setDescription("text")
                            .setRequired(true)
                    )
                    .addStringOption( option => 
                        option.setName("option1")
                            .setDescription("option1")
                            .setRequired(true)
                    )
                    .addStringOption( option => 
                        option.setName("option2")
                            .setDescription("option2")
                            .setRequired(false)
                    )
                    .addStringOption( option => 
                        option.setName("option3")
                            .setDescription("option3")
                            .setRequired(false)
                    )
                    .addStringOption( option => 
                        option.setName("option4")
                            .setDescription("option4")
                            .setRequired(false)
                    )
                    .addStringOption( option => 
                        option.setName("option5")
                            .setDescription("option5")
                            .setRequired(false)
                    )
                    .addStringOption( option => 
                        option.setName("option6")
                            .setDescription("option6")
                            .setRequired(false)
                    )
                    .addStringOption( option => 
                        option.setName("option7")
                            .setDescription("option7")
                            .setRequired(false)
                    )
                    .addStringOption( option => 
                        option.setName("option8")
                            .setDescription("option8")
                            .setRequired(false)
                    )
                    .addStringOption( option => 
                        option.setName("option9")
                            .setDescription("option9")
                            .setRequired(false)
                    )
                    .addStringOption( option => 
                        option.setName("option10")
                            .setDescription("option10")
                            .setRequired(false)
                    )


exports.registerHandler = registerHandler