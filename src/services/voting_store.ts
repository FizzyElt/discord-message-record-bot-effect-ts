import { Context, MutableHashSet, Ref } from 'effect';

export type VotingStore = MutableHashSet.MutableHashSet<string>;

export interface VotingStoreRef extends Ref.Ref<VotingStore> {}

export const VotingStoreService = Context.Tag<VotingStoreRef>();

export const createVotingStore = () => Ref.make(MutableHashSet.empty<string>());
