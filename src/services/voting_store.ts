import { Effect, Layer, MutableHashSet, pipe, Ref, ServiceMap } from "effect";

export type VotingStore = MutableHashSet.MutableHashSet<string>;

export type VotingStoreRef = Ref.Ref<VotingStore>;

// layer
export class VotingService extends ServiceMap.Service<
    VotingService,
    {
        isUserVoting: (userId: string) => Effect.Effect<boolean>;
        addNewVoting: (userId: string) => Effect.Effect<void>;
        removeVoting: (userId: string) => Effect.Effect<void>;
        getVotingStore: () => Effect.Effect<VotingStore>;
    }
>()("VotingService") {}

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
            getVotingStore,
            isUserVoting,
            addNewVoting,
            removeVoting,
        };
    }),
);

export const getVotingStore = () =>
    pipe(
        Effect.service(VotingService),
        Effect.flatMap((service) => service.getVotingStore()),
    );

export const removeVoting = (userId: string) =>
    pipe(
        Effect.service(VotingService),
        Effect.flatMap((service) => service.removeVoting(userId)),
    );

export const isUserVoting = (userId: string) =>
    pipe(
        Effect.service(VotingService),
        Effect.flatMap((service) => service.isUserVoting(userId)),
    );

export const addNewVoting = (userId: string) =>
    pipe(
        Effect.service(VotingService),
        Effect.flatMap((service) => service.addNewVoting(userId)),
    );
