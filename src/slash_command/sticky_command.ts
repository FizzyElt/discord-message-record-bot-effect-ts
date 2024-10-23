import type { APIApplicationCommandOptionChoice } from "discord.js";
import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { map } from "effect/Array";
import { pipe } from "effect";

export type Sticky = {
  name: string;
  url: string;
};

export enum StickyCommandName {
  sticky = "sticky",
  create_sticky = "create_sticky",
  delete_sticky = "delete_sticky",
}

export const stickyCommands = [
  new SlashCommandBuilder()
    .setName(StickyCommandName.create_sticky)
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
    .setName(StickyCommandName.delete_sticky)
    .setDescription("刪除貼圖")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("name")
        .setDescription("sticky name")
        .setRequired(true),
    ),
];

export const createStickyChoicesCommand = (data: ReadonlyArray<Sticky>) =>
  pipe(
    data,
    map<ReadonlyArray<Sticky>, APIApplicationCommandOptionChoice<string>>(
      ({ name }) => ({
        name,
        value: name,
      }),
    ),
    (choices) =>
      new SlashCommandBuilder()
        .setName(StickyCommandName.sticky)
        .setDescription("貼圖")
        .addStringOption(
          new SlashCommandStringOption()
            .setName("name")
            .setDescription("name")
            .setChoices(...choices)
            .setRequired(true),
        ),
  );
