import Josh from "@joshdb/core";
import provider from "@joshdb/sqlite";
import config from "./config.js";

// Export the database for guild settings
export const settings = new Josh({
    name: "settings",
    provider,
    autoEnsure: config.defaultSettings,
});

// Export a seperate database for RSS feeds
export const rss = new Josh({
    name: "rss",
    provider,
});
