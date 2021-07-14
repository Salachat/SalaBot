import config from "./config.js";
import { ensureCommand } from "./util.js";

/**
 * Create or update slash commands
 * @param {Client} client
 */
const ensure = async (client) => {
    console.log("Ensuring slash commands...");

    await client.application.commands.fetch();
    await (await client.guilds.fetch(config.devGuild)).commands.fetch();

    await Promise.all(
        Array.from(client.commands.values()).map(({ data: { slash } }) =>
            ensureCommand(client, slash)
        )
    );

    console.log("Slash commands ensured!");
};

export default ensure;
