import { Layer, pipe } from "effect";
import { ChannelService, ChannelServiceLive } from "./channel_store";
import { ClientContext, ClientLive } from "./client";
import { DatabaseLive } from "./database";
import { EnvConfig, EnvLive } from "./env";
import { StickyStoreLive } from "./sticky_store";
import { TimeoutInfoListLive, TimeoutInfoListService } from "./timeout";
import { VotingService, VotingServiceLive } from "./voting_store";

export const MainLive = pipe(
  Layer.merge(ClientLive, ChannelServiceLive),
  Layer.merge(StickyStoreLive),
  Layer.provideMerge(DatabaseLive),
  Layer.provideMerge(EnvLive),
  Layer.merge(VotingServiceLive),
  Layer.merge(TimeoutInfoListLive),
);

export {
  ChannelService,
  ClientContext,
  EnvConfig,
  TimeoutInfoListService,
  VotingService,
};
