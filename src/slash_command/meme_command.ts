import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

export const MemeCommandName = {
    CAT: "cat",
    EMOJIJI: "emo_jiji",
} as const;

export const memeCommands = [
    new SlashCommandBuilder().setName(MemeCommandName.CAT).setDescription("貓貓"),

    new SlashCommandBuilder()
        .setName(MemeCommandName.EMOJIJI)
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
