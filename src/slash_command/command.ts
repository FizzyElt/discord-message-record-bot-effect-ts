import type { APIApplicationCommandOptionChoice } from "discord.js";

import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

import { choiceList } from "../services/timeout";

const createStringChoice = (
  name: string,
  value: string,
): APIApplicationCommandOptionChoice<string> => ({ name: name, value: value });

export enum CommandName {
  add_channels = "add_channels",
  remove_channels = "remove_channels",
  channel_list = "channel_list",
  ban_user = "ban_user",
  timeout_info = "timeout_info",
  subscribe = "subscribe",
  unsubscribe = "unsubscribe",
}

export const commands = [
  new SlashCommandBuilder()
    .setName(CommandName.add_channels)
    .setDescription("add exclusive channels")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("id")
        .setDescription("channel_id or category_id")
        .setMaxLength(150)
        .setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName(CommandName.remove_channels)
    .setDescription("remove exclusive channels")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("id")
        .setDescription("channel_id or category_id")
        .setMaxLength(150)
        .setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName(CommandName.channel_list)
    .setDescription("list exclusive channels"),

  new SlashCommandBuilder()
    .setName(CommandName.ban_user)
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
        .setChoices(
          ...choiceList.map((info) => createStringChoice(info.name, info.key)),
        )
        .setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName(CommandName.timeout_info)
    .setDescription("投票規則"),

  new SlashCommandBuilder()
    .setName(CommandName.subscribe)
    .setDescription("成為民主的一員"),
  new SlashCommandBuilder()
    .setName(CommandName.unsubscribe)
    .setDescription("取消民主的一員"),
];
