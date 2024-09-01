import { ApplicationCommandOptionType } from "discord.js";
import { Equal, Option, pipe } from "effect";
import * as Function from "effect/Function";
import * as Number from "effect/Number";
import * as String from "effect/String";

import type { CommandInteraction } from "discord.js";

export const getCommandOptionOfType =
  (type: ApplicationCommandOptionType, optionName: string) =>
  (interaction: CommandInteraction) =>
    pipe(
      interaction.options.data.find(({ name }) =>
        Equal.equals(name, optionName),
      ),
      Option.fromNullable,
      Option.filter((option) => Equal.equals(option.type, type)),
    );

export const getCommandOptionString =
  (optionName: string) => (interaction: CommandInteraction) =>
    pipe(
      interaction,
      getCommandOptionOfType(ApplicationCommandOptionType.String, optionName),
      Option.map((option) => option.value),
      Option.filter(String.isString),
      Option.getOrElse(Function.constant("")),
    );

export const getCommandOptionInteger =
  (optionName: string) => (interaction: CommandInteraction) =>
    pipe(
      interaction,
      getCommandOptionOfType(ApplicationCommandOptionType.Integer, optionName),
      Option.map((option) => option.value),
      Option.filter(Number.isNumber),
      Option.getOrElse(Function.constant(0)),
    );
