import ensureSlash from "../ensureSlash.js";
import config from "../config.js";
import startRss from "../rss/rssHandler.js";

export default async (client) => {
    // Load slash commands unless config says to skip it
    if (!config.skipSlashEnsure) await ensureSlash(client);

    // Start the RSS handler
    startRss(client);

    console.log(`Online as ${client.user.tag} in ${process.env.NODE_ENV} mode!`);
};
