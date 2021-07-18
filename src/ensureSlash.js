import config from "./config.js";

/**
 * Create or update slash commands
 * @param {Client} client
 */
const ensure = async (client) => {
    console.log("Ensuring slash commands...");

    await client.application.commands.fetch();
    const devGuild = await client.guilds.fetch(config.devGuild);
    await devGuild.commands.fetch();

    const commands = client.commands.map(({ data: { slash } }) => slash);

    if (process.env.NODE_ENV === "development") await devGuild.commands.set(commands);
    else await client.application.commands.set(commands);

    console.log("Slash commands ensured!");
};

export default ensure;
