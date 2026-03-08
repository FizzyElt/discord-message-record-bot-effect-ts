import { ActivityType, type Client } from "discord.js";

export const clientReady = (client: Client<true>): void => {
    client.user.setActivity("你的py", { type: ActivityType.Watching });
};
