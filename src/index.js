import { Client, Intents } from "discord.js";
import load from "./loader.js";
import config from "./config.js";

// Set environment to development when none specified
if (!process.env.NODE_ENV) process.env.NODE_ENV = "development";

// Create the client
const client = new Client({
    // Pre disable pings
    allowedMentions: { users: [], roles: [] },
    // Only the necessary intentss
    intents: [
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
    // Ws events to receive more data
    ws: {
        large_threshold: 100,
    },
    sweepers: {
        messages: {
            interval: 60 * 30,
            lifetime: 60 * 60 * 24,
        },
    },
});

// Login and start loading modules
client.login(config.token);
load(client);

// Route shutdown signals to gracefully shutdown
process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());
process.on("exit", () => {
    client.destroy();
    console.log("Exited...");
});
