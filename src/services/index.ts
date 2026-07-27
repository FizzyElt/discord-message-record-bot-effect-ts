import { NodeFileSystem } from "@effect/platform-node";
import { Layer, pipe } from "effect";

import { ChannelService, ChannelServiceLive } from "./channel_store";
import { ClientContext, ClientLive } from "./client";
import { EnvConfig, EnvLive } from "./env";
import { TimeoutInfoListLive, TimeoutInfoListService } from "./timeout";
import { VotingService, VotingServiceLive } from "./voting_store";

export const MainLive = pipe(
    Layer.merge(ClientLive, ChannelServiceLive),
    Layer.merge(VotingServiceLive),
    Layer.merge(TimeoutInfoListLive),
    Layer.provideMerge(EnvLive),
    Layer.provide(NodeFileSystem.layer),
);

export { ChannelService, ClientContext, EnvConfig, TimeoutInfoListService, VotingService };
