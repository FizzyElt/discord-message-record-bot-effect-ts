import type {
  BaseInteraction,
  CacheType,
  CommandInteraction,
} from "discord.js";

export const isCommandInteraction = (
  interaction: BaseInteraction<CacheType>,
): interaction is CommandInteraction<CacheType> => interaction.isCommand();
