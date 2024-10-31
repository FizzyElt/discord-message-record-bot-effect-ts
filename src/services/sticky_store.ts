import {
  SlashCommandBuilder,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import {
  Array,
  Context,
  Data,
  Effect,
  Equal,
  Layer,
  Number,
  Ref,
  pipe,
} from "effect";

import type { Sticky } from "~/model/sticky";
import * as StickyModel from "~/model/sticky";
import { commands } from "~/slash_command/main_command";
import { memeCommands } from "~/slash_command/meme_command";
import { pushCommands } from "~/slash_command/push_commands";
import {
  StickyCommandName,
  stickyCommands,
} from "~/slash_command/sticky_command";

const createStickyCommand = (data: Sticky[]) => {
  const dataMap = data.reduce<Record<string, Sticky[]>>((acc, item) => {
    if (item.group && acc[item.group]) {
      acc[item.group].push(item);
      return acc;
    }

    if (item.group) {
      acc[item.group] = [item];
      return acc;
    }

    return acc;
  }, {});

  const command = new SlashCommandBuilder()
    .setName(StickyCommandName.sticky)
    .setDescription("貼圖");

  for (const [group, stickies] of Object.entries(dataMap)) {
    command.addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName(group)
        .setDescription(group)
        .addStringOption(
          new SlashCommandStringOption()
            .setName("name")
            .setDescription("name")
            .setChoices(...stickies.map(({ name }) => ({ name, value: name }))),
        ),
    );
  }
  return command;
};

const syncData = () =>
  pipe(
    StickyModel.queryStickies(),
    Effect.tap((stickies) =>
      Equal.equals(stickies.length, 0)
        ? pushCommands([...commands, ...memeCommands, ...stickyCommands])
        : pushCommands([
            ...commands,
            ...memeCommands,
            ...stickyCommands,
            createStickyCommand(stickies),
          ]),
    ),
  );

class StickyOptionLimitError extends Data.TaggedError(
  "StickyOptionLimitError",
)<{
  message: string;
}> {}

class GroupLimitError extends Data.TaggedError("GroupLimitError")<{
  message: string;
}> {}

export class StickyService extends Context.Tag("StickyService")<
  StickyService,
  Ref.Ref<Sticky[]>
>() {}

export const StickyStoreLive = Layer.effect(
  StickyService,
  Effect.gen(function* () {
    const stickies = yield* syncData();

    const stickiesStore = yield* Ref.make<Sticky[]>(stickies);

    return stickiesStore;
  }),
);

export const getSticky = (name: string) =>
  pipe(
    StickyService,
    Effect.flatMap(Ref.get),
    Effect.flatMap(
      Array.findFirst((sticky) => Equal.equals(sticky.name, name)),
    ),
  );

export const createNewSticky = (name: string, url: string, group: string) =>
  pipe(
    StickyModel.groupCount(),
    Effect.filterOrFail(
      Number.greaterThanOrEqualTo(25),
      () => new GroupLimitError({ message: "group is reach limit" }),
    ),

    Effect.flatMap(() => StickyModel.stickyCountByGroup(group)),
    Effect.filterOrFail(
      Number.greaterThanOrEqualTo(25),
      () =>
        new StickyOptionLimitError({
          message: `group ${group} options is reach limit`,
        }),
    ),

    Effect.flatMap(() => StickyModel.insertSticky(name, url, group)),
    Effect.flatMap(syncData),
    Effect.flatMap((stickies) =>
      Effect.gen(function* () {
        const stickiesStore = yield* StickyService;
        yield* Ref.set(stickiesStore, stickies);
      }),
    ),
  );

export const deleteSticky = (name: string) =>
  pipe(
    StickyModel.deleteSticky(name),
    Effect.flatMap(syncData),
    Effect.flatMap((stickies) =>
      Effect.gen(function* () {
        const stickiesStore = yield* StickyService;
        yield* Ref.set(stickiesStore, stickies);
      }),
    ),
  );
