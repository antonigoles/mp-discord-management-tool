const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const COMMAND_NAME  =   "poll";
const DESCRIPTION   =   "Creates poll";

const registerHandler = async (client) => {
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
            for( let i = 1; i<=15; i++ ) {
                if ( interaction.options.getString(`option${i}`) != null ) {
                    pollOptions.push( interaction.options.getString(`option${i}`) )
                }
            }
            const emojiTable = "🚗🚕🚙🚌🚎🏎🚓🚑🚒🚐🚚🚛🚜🛴🚲🛵🏍🚨🚔🚍".split("")
            const title = interaction.options.getString('text')
            const pollEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle("Ankieta")
                .addFields( [
                    { 
                        name: `${title} \n`,
                        value: `${pollOptions.map( (opt,idx) => {
                            return `${emojiTable[idx]} \`${opt}\``
                        }).join("\n")}`
                     }
                        
                    ] 
                );

            const interactionMessage = await interaction.reply({ content: " ", embeds: [ pollEmbed ], fetchReply: true })
            for ( let j = 0; j<pollOptions.length; j++ ) 
                await interactionMessage.react( emojiTable[j] );
        }
    });
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
                    .addStringOption( option =>
                        option.setName("option11")
                            .setDescription("option11")
                            .setRequired(false)
                    )
                    .addStringOption( option =>
                        option.setName("option12")
                            .setDescription("option12")
                            .setRequired(false)
                    )
                    .addStringOption( option =>
                        option.setName("option13")
                            .setDescription("option13")
                            .setRequired(false)

                    )
                    .addStringOption( option =>
                        option.setName("option14")
                            .setDescription("option14")
                            .setRequired(false)
                    )
                    .addStringOption( option =>
                        option.setName("option15")
                            .setDescription("option15")
                            .setRequired(false)
                    )


exports.registerHandler = registerHandler