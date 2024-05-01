import { Effect, MutableHashSet, Context, Ref } from "effect";

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
