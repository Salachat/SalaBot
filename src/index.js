import { Client, Intents } from "discord.js";
import load from "./loader.js";
// eslint-disable-next-line import/no-unresolved
import config from "./config.js";

const client = new Client({
    messageCacheLifetime: 60 * 60 * 24,
    messageSweepInterval: 60 * 30,
    allowedMentions: { users: [], roles: [] },
    intents: [
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
    ],
    ws: {
        large_threshold: 100,
    },
});

client.config = config;
client.login(client.config.token);
load(client);

process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());
process.on("exit", () => {
    client.destroy();
    console.log("Exited...");
});
