import { Layer, pipe } from "effect";

import { EnvLive, EnvConfig } from "./env";
import { ChannelService, ChannelServiceLive } from "./channel_store";
import { ClientContext, ClientLive } from "./client";
import { VotingServiceLive, VotingService } from "./voting_store";
import { TimeoutInfoListLive, TimeoutInfoListService } from "./timeout";

export const MainLive = pipe(
  Layer.merge(ClientLive, ChannelServiceLive),
  Layer.provideMerge(EnvLive),
  Layer.merge(VotingServiceLive),
  Layer.merge(TimeoutInfoListLive),
);

export {
  EnvConfig,
  ChannelService,
  ClientContext,
  VotingService,
  TimeoutInfoListService,
};
