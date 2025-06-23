import {
  ApplicationCommandOptionType,
  type CommandInteraction,
} from "discord.js";
import { Equal, Function, Number, Option, pipe, String, Struct } from "effect";

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
      Option.map(Struct.get("value")),
      Option.filter(String.isString),
      Option.getOrElse(Function.constant("")),
    );

export const getCommandOptionInteger =
  (optionName: string) => (interaction: CommandInteraction) =>
    pipe(
      interaction,
      getCommandOptionOfType(ApplicationCommandOptionType.Integer, optionName),
      Option.map(Struct.get("value")),
      Option.filter(Number.isNumber),
      Option.getOrElse(Function.constant(0)),
    );
