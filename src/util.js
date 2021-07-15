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
