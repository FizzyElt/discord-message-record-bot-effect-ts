import { Effect } from "effect";
import { EnvLive } from "../services/env";
import { pushCommands } from "./push_commands";
import {
  SlashCommandBuilder,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";

const testCommands = [
  new SlashCommandBuilder()
    .setName("create_sticky")
    .setDescription("新增貼圖")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("name")
        .setDescription("sticky name")
        .setRequired(true),
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName("url")
        .setDescription("sticky url")
        .setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName("delete")
    .setDescription("刪除貼圖")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("name")
        .setDescription("sticky name")
        .setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName("sticky")
    .setDescription("sticky")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("group")
        .setDescription("group")
        .addStringOption(
          new SlashCommandStringOption()
            .setName("name")
            .setDescription("name")
            .setChoices({ name: "1", value: "1" })
            .setRequired(true),
        ),
    ),
];

const program = pushCommands(testCommands).pipe(Effect.provide(EnvLive));

Effect.runPromise(program);
