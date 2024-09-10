import { Context, Effect, MutableHashSet, Ref, Layer, pipe } from "effect";

export type VotingStore = MutableHashSet.MutableHashSet<string>;

export interface VotingStoreRef extends Ref.Ref<VotingStore> {}

export class VotingStoreService extends Context.Tag("VotingStoreService")<
  VotingStoreService,
  VotingStoreRef
>() {}

export const getVotingStore = VotingStoreService.pipe(Effect.flatMap(Ref.get));

export const isUserVoting = (userId: string) => MutableHashSet.has(userId);

export const addNewVoting = (userId: string) =>
  VotingStoreService.pipe(
    Effect.flatMap(Ref.update(MutableHashSet.add(userId))),
  );

export const removeVoting = (userId: string) =>
  VotingStoreService.pipe(
    Effect.flatMap(Ref.update(MutableHashSet.remove(userId))),
  );

export const createVotingStore = () => Ref.make(MutableHashSet.empty<string>());

// layer
class VotingService extends Context.Tag("VotingService")<
  VotingService,
  {
    isUserVoting: (userId: string) => Effect.Effect<boolean>;
    addNewVoting: (userId: string) => Effect.Effect<void>;
    removeVoting: (userId: string) => Effect.Effect<void>;
  }
>() {}

export const VotingServiceLive = Layer.effect(
  VotingService,
  Effect.gen(function* () {
    const votingStoreRef = yield* Ref.make(MutableHashSet.empty<string>());

    const getVotingStore = () => Ref.get(votingStoreRef);

    const isUserVoting = (userId: string) =>
      pipe(getVotingStore(), Effect.map(MutableHashSet.has(userId)));

    const addNewVoting = (userId: string) =>
      Ref.update(votingStoreRef, MutableHashSet.add(userId));

    const removeVoting = (userId: string) =>
      Ref.update(votingStoreRef, MutableHashSet.remove(userId));

    return {
      isUserVoting,
      addNewVoting,
      removeVoting,
    };
  }),
);
