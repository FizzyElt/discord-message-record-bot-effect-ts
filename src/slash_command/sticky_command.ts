import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

export enum StickyCommandName {
    sticky = "sticky",
    create_sticky = "create_sticky",
    delete_sticky = "delete_sticky",
    backup_sticky = "backup_sticky",
}

export const stickyCommands = [
    new SlashCommandBuilder()
        .setName(StickyCommandName.create_sticky)
        .setDescription("新增貼圖")
        .addStringOption(
            new SlashCommandStringOption()
                .setName("name")
                .setDescription("sticky name")
                .setRequired(true)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("url")
                .setDescription("sticky url")
                .setRequired(true)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("group")
                .setDescription("sticky group 預設 default")
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName(StickyCommandName.delete_sticky)
        .setDescription("刪除貼圖")
        .addStringOption(
            new SlashCommandStringOption()
                .setName("name")
                .setDescription("sticky name")
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName(StickyCommandName.backup_sticky)
        .setDescription("備份貼圖"),
];
