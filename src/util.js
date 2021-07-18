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

const multiples = {
    MILLISECOND: 1,
    SECOND: 1000,
    MINUTE: 1000 * 60,
    HOUR: 1000 * 60 * 60,
    DAY: 1000 * 60 * 60 * 24,
    WEEK: 1000 * 60 * 60 * 24 * 7,
    MONTH: 1000 * 60 * 60 * 24 * 30,
    YEAR: 1000 * 60 * 60 * 24 * 365,
};

const shorts = {
    seconds: "secs",
    minutes: "mins",
    hours: "hrs",
    days: "d ",
    months: "m ",
    years: "y ",
};

export const formatDuration = (ms, options = {}) => {
    if (typeof ms !== "number") throw new TypeError("Ms needs to be a number.");
    if (typeof options !== "object") throw new TypeError("Options needs to be an object.");
    const short = options.short ?? false;
    const amount = options.amount ?? 3;
    if (typeof short !== "boolean") throw new TypeError("Options.short needs to be a boolean.");
    if (typeof amount !== "number") throw new TypeError("Options.amount needs to be an number.");

    ms = Math.floor(ms / 1000) * 1000;
    const years = Math.floor(ms / multiples.YEAR);
    ms -= years * multiples.YEAR;
    const months = Math.floor(ms / multiples.MONTH);
    ms -= months * multiples.MONTH;
    const days = Math.floor(ms / multiples.DAY);
    ms -= days * multiples.DAY;
    const hours = Math.floor(ms / multiples.HOUR);
    ms -= hours * multiples.HOUR;
    const minutes = Math.floor(ms / multiples.MINUTE);
    ms -= minutes * multiples.MINUTE;
    const seconds = Math.floor(ms / multiples.SECOND);

    return Object.entries({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
    })
        .filter((t) => Boolean(t[1]))
        .slice(0, amount)
        .map(
            ([u, v]) =>
                `${v}${
                    // eslint-disable-next-line no-nested-ternary
                    short
                        ? v > 1
                            ? shorts[u].trim()
                            : shorts[u].substring(0, shorts[u].length - 1)
                        : ` ${v > 1 ? u : u.substring(0, u.length - 1)}`
                }`
        )
        .join(", ");
};
