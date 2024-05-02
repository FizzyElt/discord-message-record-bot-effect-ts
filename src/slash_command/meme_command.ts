import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

export enum MemeCommandName {
  pyParty = "py_party",
  myParty = "my_party",
  noImage = "no_image",
  cat = "cat",
  emoJiji = "emo_jiji",
}

export const memeCommands = [
  new SlashCommandBuilder()
    .setName(MemeCommandName.pyParty)
    .setDescription("py party"),

  new SlashCommandBuilder()
    .setName(MemeCommandName.myParty)
    .setDescription("my party"),

  new SlashCommandBuilder()
    .setName(MemeCommandName.noImage)
    .setDescription("沒圖說個雞巴"),

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
