import type { EnvConfig } from "@services/env";
import { commands } from "@slashCommand/main_command";
import { memeCommands } from "@slashCommand/meme_command";
import { pushCommands } from "@slashCommand/push_commands";
import {
  type Sticky,
  createStickyChoicesCommand,
  stickyCommands,
} from "@slashCommand/sticky_command";
import { Context, Effect, Layer, Ref, pipe, Array, Data, Equal } from "effect";
import { readFile, writeFile } from "node:fs/promises";

export type StickyStore = ReadonlyArray<Sticky>;

export type StickyStoreRef = Ref.Ref<StickyStore>;

export const readStickyData = () => {
  return Effect.tryPromise({
    try: () => readFile("/dc_bot/sticky_data.json", "utf-8"),
    catch: (err) => err,
  }).pipe(Effect.map((res) => JSON.parse(res) as { data: StickyStore }));
};

export const writeStickyData = (data: StickyStore) => {
  return Effect.tryPromise({
    try: () => writeFile("/dc_bot/sticky_data.json", JSON.stringify({ data })),
    catch: (err) => err,
  });
};

export class UpdateStickyError extends Data.TaggedError("UpdateStickyError")<{
  message: unknown;
}> {}

export class StickyService extends Context.Tag("StickyService")<
  StickyService,
  {
    getStickyStore: () => Effect.Effect<StickyStore>;
    updateStickyData: (
      data: StickyStore,
    ) => Effect.Effect<void, UpdateStickyError, EnvConfig>;
  }
>() {}

export const StickyStoreLive = Layer.effect(
  StickyService,
  Effect.gen(function* () {
    const stickyStore = yield* pipe(
      readStickyData(),
      Effect.orElse(() => Effect.succeed({ data: [] })),
      Effect.tap(Effect.log),
      Effect.tap(({ data }) =>
        pushCommands(
          data.length > 0
            ? [
                ...commands,
                ...memeCommands,
                ...stickyCommands,
                createStickyChoicesCommand(data),
              ]
            : [...commands, ...memeCommands, ...stickyCommands],
        ),
      ),
      Effect.flatMap(({ data }) => Ref.make<StickyStore>(data)),
    );

    const updateStickyData = (data: StickyStore) =>
      pipe(
        writeStickyData(data),
        Effect.flatMap(() =>
          pushCommands(
            data.length > 0
              ? [
                  ...commands,
                  ...memeCommands,
                  ...stickyCommands,
                  createStickyChoicesCommand(data),
                ]
              : [...commands, ...memeCommands, ...stickyCommands],
          ),
        ),
        Effect.flatMap(() => Ref.update(stickyStore, () => data)),
        Effect.mapError((err) => new UpdateStickyError({ message: err })),
      );

    const getStickyStore = () => Ref.get(stickyStore);

    return { getStickyStore, updateStickyData };
  }),
);

class DuplicateNameError extends Data.TaggedError("DuplicateStickyError") {}

export const createNewSticky = (sticky: Sticky) =>
  pipe(
    StickyService,
    Effect.flatMap(({ getStickyStore, updateStickyData }) =>
      pipe(
        getStickyStore(),
        Effect.flatMap((data) =>
          Array.some(data, ({ name }) => Equal.equals(name, sticky.name))
            ? Effect.fail(new DuplicateNameError())
            : Effect.succeed(data),
        ),
        Effect.flatMap((data) => updateStickyData([...data, sticky])),
      ),
    ),
  );

export const deleteSticky = (stickyName: string) =>
  pipe(
    StickyService,
    Effect.flatMap(({ getStickyStore, updateStickyData }) =>
      pipe(
        getStickyStore(),
        Effect.flatMap((data) =>
          updateStickyData(
            Array.filter(data, ({ name }) => !Equal.equals(name, stickyName)),
          ),
        ),
      ),
    ),
  );

export const getSticky = (name: string) =>
  pipe(
    StickyService,
    Effect.flatMap(({ getStickyStore }) => getStickyStore()),
    Effect.flatMap((stickies) =>
      Array.findFirst(stickies, (sticky) => Equal.equals(name, sticky.name)),
    ),
  );
