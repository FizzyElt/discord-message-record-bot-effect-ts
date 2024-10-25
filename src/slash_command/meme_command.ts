import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

export enum MemeCommandName {
  cat = "cat",
  emoJiji = "emo_jiji",
}

export const memeCommands = [
  new SlashCommandBuilder().setName(MemeCommandName.cat).setDescription("貓貓"),

  new SlashCommandBuilder()
    .setName(MemeCommandName.emoJiji)
    .setDescription("emoji_kitchen")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("left")
        .setDescription("left emoji")
        .setRequired(true),
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName("right")
        .setDescription("right emoji")
        .setRequired(true),
    ),
];
