const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
  InteractionCollector,
} = require("discord.js");
const Utils = require("../utils.js");

const COMMAND_NAME = "poll";
const DESCRIPTION = "Creates poll";

const command_temporary_memory = {};

const poll = async (interaction) => {
  const emojiTable = "🔴,🟠,🟡,🟢,🔵,🟣,🟤,⚫,⚪,🟥,🟧,🟨,🟩,🟦,🟪,🟫".split(
    ","
  );

  if (!interaction.isCommand()) return;
  if (!(interaction.commandName === COMMAND_NAME)) return;

  const member = interaction.member;

  if (!(await Utils.isAdmin(member)) && !Utils.isTeacher(member)) {
    interaction.reply({ content: "Nie jesteś Nauczycielem!" });
    return;
  }

  const pollOptions = [];
  for (let i = 1; i <= 15; i++) {
    if (interaction.options.getString(`option${i}`) != null) {
      pollOptions.push(interaction.options.getString(`option${i}`));
    }
  }

  const title = interaction.options.getString("text");
  const pollEmbed = new MessageEmbed()
    .setAuthor({
      name: "Ankieta",
      iconURL:
        "https://www.seekpng.com/png/full/67-671514_learn-more-free-survey-icon.png",
    })
    .setColor("#ff1d00")
    .setTitle(title)
    .addFields([
      {
        name: `*Opcje:*`,
        value: `${pollOptions
          .map((opt, idx) => {
            return `${emojiTable[idx]} - \`${opt}\``;
          })
          .join("\n")}`,
      },
    ])
    .setFooter({
      text: `${pollOptions
        .map((opt, idx) => {
          return `${emojiTable[idx]}: 0`;
        })
        .join(" ")}`,
    });

  const timestamp = Date.now();

  command_temporary_memory[timestamp] = {
    size: pollOptions.length,
  };
  pollOptions.map((_, idx) => {
    command_temporary_memory[timestamp][idx + 1] = [];
  });

  const row = new MessageActionRow().addComponents([
    new MessageSelectMenu()
      .setCustomId("select-poll-answer")
      .setPlaceholder("Brak odpowiedzi")
      .addOptions([
        ...pollOptions.map((opt, idx) => {
          return {
            label: `${emojiTable[idx]} ${opt}`,
            description: `Opcja ${idx + 1}`,
            value: `option-${idx + 1}-${timestamp}`,
          };
        }),
      ]),
  ]);

  const interactionMessage = await interaction.reply({
    content: " ",
    embeds: [pollEmbed],
    fetchReply: true,
    components: [row],
  });

  // handle input select interaction
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isSelectMenu()) return;
    if (interaction.customId != "select-poll-answer") return;

    // this is just awful and one day has to go
    // but not now...

    const choice = interaction.values[0].split("-");
    const timestamp = choice[2];
    const choiceid = choice[1];

    const originalMessage = interaction.message;

    const pollOptions = [];

    if (command_temporary_memory[timestamp] == undefined) {
      await interaction.reply({
        content: "Ta ankieta już wygasła :(",
        ephemeral: true,
      });
      return;
    }

    // if user has choosen this option already we want to remove his vote
    let check = command_temporary_memory[timestamp][choiceid].includes(
      interaction.user.id
    );

    for (let i = 1; i <= command_temporary_memory[timestamp]["size"]; i++) {
      // XD
      pollOptions.push(i);
      command_temporary_memory[timestamp][i] = Utils.removeItemOnce(
        command_temporary_memory[timestamp][i],
        interaction.user.id
      );
    }
    if (!check)
      command_temporary_memory[timestamp][choiceid].push(interaction.user.id);

    originalMessage.embeds[0].setFooter({
      text: `${pollOptions
        .map(
          (opt, idx) =>
            `${emojiTable[idx]}: ${
              command_temporary_memory[timestamp][idx + 1].length
            }`
        )
        .join(" ")}`,
    });

    originalMessage.content = " ";
    interaction.update({
      content: " ",
      components: originalMessage.components,
      embeds: originalMessage.embeds,
      fetchReply: true,
    });
  });
};

exports.command = new SlashCommandBuilder()
  .setName(COMMAND_NAME)
  .setDescription(DESCRIPTION)
  .addStringOption((option) =>
    option.setName("text").setDescription("text").setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("option1").setDescription("option1").setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("option2").setDescription("option2").setRequired(false)
  )
  .addStringOption((option) =>
    option.setName("option3").setDescription("option3").setRequired(false)
  )
  .addStringOption((option) =>
    option.setName("option4").setDescription("option4").setRequired(false)
  )
  .addStringOption((option) =>
    option.setName("option5").setDescription("option5").setRequired(false)
  )
  .addStringOption((option) =>
    option.setName("option6").setDescription("option6").setRequired(false)
  )
  .addStringOption((option) =>
    option.setName("option7").setDescription("option7").setRequired(false)
  )
  .addStringOption((option) =>
    option.setName("option8").setDescription("option8").setRequired(false)
  )
  .addStringOption((option) =>
    option.setName("option9").setDescription("option9").setRequired(false)
  )
  .addStringOption((option) =>
    option.setName("option10").setDescription("option10").setRequired(false)
  )
  .addStringOption((option) =>
    option.setName("option11").setDescription("option11").setRequired(false)
  )
  .addStringOption((option) =>
    option.setName("option12").setDescription("option12").setRequired(false)
  )
  .addStringOption((option) =>
    option.setName("option13").setDescription("option13").setRequired(false)
  )
  .addStringOption((option) =>
    option.setName("option14").setDescription("option14").setRequired(false)
  )
  .addStringOption((option) =>
    option.setName("option15").setDescription("option15").setRequired(false)
  );

exports.commandName = COMMAND_NAME;
exports.handlers = [{ type: "command", func: poll }];
