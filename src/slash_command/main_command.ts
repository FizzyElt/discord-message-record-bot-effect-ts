import {
    type APIApplicationCommandOptionChoice,
    SlashCommandBuilder,
    SlashCommandStringOption,
} from "discord.js";

import { choiceList } from "~/services/timeout";

const createStringChoice = (
    name: string,
    value: string,
): APIApplicationCommandOptionChoice<string> => {
    return {
        name: name,
        value: value,
    };
};

export const CommandName = {
    ADD_CHANNELS: "add_channels",
    REMOVE_CHANNELS: "remove_channels",
    CHANNEL_LIST: "channel_list",
    BAN_USER: "ban_user",
    TIMEOUT_INFO: "timeout_info",
    SUBSCRIBE: "subscribe",
    UNSUBSCRIBE: "unsubscribe",
    GET_OFF_WORK: "get_off_work",
} as const;

export const commands = [
    new SlashCommandBuilder()
        .setName(CommandName.ADD_CHANNELS)
        .setDescription("add exclusive channels")
        .addStringOption(
            new SlashCommandStringOption()
                .setName("id")
                .setDescription("channel_id or category_id")
                .setMaxLength(150)
                .setRequired(true),
        ),

    new SlashCommandBuilder()
        .setName(CommandName.REMOVE_CHANNELS)
        .setDescription("remove exclusive channels")
        .addStringOption(
            new SlashCommandStringOption()
                .setName("id")
                .setDescription("channel_id or category_id")
                .setMaxLength(150)
                .setRequired(true),
        ),

    new SlashCommandBuilder()
        .setName(CommandName.CHANNEL_LIST)
        .setDescription("list exclusive channels"),

    new SlashCommandBuilder()
        .setName(CommandName.BAN_USER)
        .setDescription("ban user plus")
        .addStringOption(
            new SlashCommandStringOption()
                .setName("mention_user")
                .setDescription("mention user")
                .setMaxLength(150)
                .setRequired(true),
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("time")
                .setDescription("time")
                .setChoices(...choiceList.map((info) => createStringChoice(info.name, info.key)))
                .setRequired(true),
        ),

    new SlashCommandBuilder().setName(CommandName.TIMEOUT_INFO).setDescription("投票規則"),

    new SlashCommandBuilder().setName(CommandName.SUBSCRIBE).setDescription("成為民主的一員"),
    new SlashCommandBuilder().setName(CommandName.UNSUBSCRIBE).setDescription("取消民主的一員"),
    new SlashCommandBuilder()
        .setName(CommandName.GET_OFF_WORK)
        .setDescription("今天這個逼班就上到這了"),
];
