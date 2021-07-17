import Josh from "@joshdb/core";
import provider from "@joshdb/sqlite";

// Export the database for guild settings
export const settings = new Josh({
    name: "settings",
    provider,
});

// Export a seperate database for RSS feeds
export const rss = new Josh({
    name: "rss",
    provider,
});
