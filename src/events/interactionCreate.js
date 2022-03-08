import command from "../interactions/command.js";
import config from "../config.js";
import { settings } from "../db.js";

/**
 * @param {import("discord.js").Client} client
 * @param {import("discord.js").Interaction} interaction
 */
export default async (client, interaction) => {
    // Ensure settings manually as autoEnsure is broken
    if (interaction.inGuild()) await settings.ensure(interaction.guildId, config.defaultSettings);
    // Check what type of interaction it is and route it to the correct handler
    if (interaction.isCommand()) command(client, interaction);
};
