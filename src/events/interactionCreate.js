import button from "../interactions/button.js";
import command from "../interactions/command.js";
import selectMenu from "../interactions/selectMenu.js";
import config from "../config.js";
import { settings } from "../db.js";

export default async (client, interaction) => {
    // Ensure settings manually as autoEnsure is broken
    if (interaction.inGuild()) await settings.ensure(interaction.guildId, config.defaultSettings);
    // Check what type of interaction it is and route it to the correct handler
    if (interaction.isCommand()) command(client, interaction);
    else if (interaction.isButton()) button(client, interaction);
    else if (interaction.isSelectMenu()) selectMenu(client, interaction);
};
