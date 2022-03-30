import config from "./config.js";
import container from "./container.js";

/**
 * Create or update slash commands
 * @param {import("discord.js").Client} client
 */
const ensure = async (client) => {
    console.log("Ensuring slash commands...");

    // Fetch caches
    await client.application.commands.fetch();
    const devGuild = await client.guilds.fetch(config.devGuild);
    await devGuild.commands.fetch();

    // Map commands to slash data
    const commands = container.commands.map(({ data: { slash } }) => slash);

    // Set the commands in dev guild or globally depending on the node environment
    if (process.env.NODE_ENV === "development") await devGuild.commands.set(commands);
    else await client.application.commands.set(commands);

    console.log("Slash commands ensured!");
};

export default ensure;
