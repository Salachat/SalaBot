import { inspect } from "util";
import config from "./config.js";

/**
 * Get the users permission
 * @param {CommandInteraction} command
 * @returns
 */
export const perm = (command) => {
    let lvl = 0;
    config.perms.forEach((p, i) => {
        if ((p.guildOnly ? command.inGuild() : true) && p.check(command)) lvl = i;
    });
    return lvl;
};

/**
 * Load a slash command by creating or modifying it in the development guild or globally
 * @param {Client} client
 * @param {ApplicationCommandData} data
 */
export const ensureCommand = async (client, data) => {
    if (process.env.NODE_ENV === "development") {
        const devGuild = await client.guilds.fetch(config.devGuild);
        const command = devGuild.commands.cache.find((cmd) => cmd.name === data.name);
        if (!command) await devGuild.commands.create(data);
        else await devGuild.commands.edit(command.id, data);
    } else {
        const command = client.application.commands.cache.find((cmd) => cmd.name === data.name);
        if (!command) await client.application.commands.create(data);
        else await client.application.commands.edit(command.id, data);
    }
};

export const cleanEvalResponse = (res) => {
    if (typeof res === "string") return res.replaceAll(config.token, "<TOKEN>").substring(0, 1900);
    return inspect(res, { depth: 3 }).replaceAll(config.token, "<TOKEN>").substring(0, 1900);
};

export const formatEvalMs = (ms) => {
    let value = null;
    let unit = null;
    if (ms < 1) {
        unit = "μs";
        value = Math.round(ms * 1000);
    } else {
        unit = "ms";
        value = ms.toFixed(3);
    }
    return `${value}${unit}`;
};
