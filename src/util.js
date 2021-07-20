import { inspect } from "util";
import config from "./config.js";

/**
 * Get the users permission
 * @param {CommandInteraction} command
 * @returns {Number} the author's permission level in that context
 */
export const perm = (command) => {
    let lvl = 0;
    // Loop all levels
    config.perms.forEach((p, i) => {
        // See if condition matches, set level to current index
        if ((p.guildOnly ? command.inGuild() : true) && p.check(command)) lvl = i;
    });
    // Return users permission level
    return lvl;
};

/**
 * Cleanup the eval response of tokesn and format objects.
 * @param {String} res the eval response
 * @returns {String} cleaned up string
 */
export const cleanEvalResponse = (res) => {
    // If response is a string, replace tokens and cut the text
    if (typeof res === "string") return res.replaceAll(config.token, "<TOKEN>").substring(0, 1900);
    // Otherwise util inspect it, and do the same
    return inspect(res, { depth: 3 }).replaceAll(config.token, "<TOKEN>").substring(0, 1900);
};

/**
 * Format eval duration to micro or milliseconds
 * @param {*} ms milliseconds
 * @returns {String} formatted time
 */
export const formatEvalMs = (ms) => {
    let value = null;
    let unit = null;
    // Check if the eval was faster than a millisecond
    if (ms < 1) {
        // Set unit and do match
        unit = "μs";
        value = Math.round(ms * 1000);
    } else {
        // Otherwise set unit and round the number
        unit = "ms";
        value = ms.toFixed(3);
    }
    // Return in a string form
    return `${value}${unit}`;
};

// Millisecond multiples of different time units
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

// Short forms for time units
const shorts = {
    seconds: "secs",
    minutes: "mins",
    hours: "hrs",
    days: "d ",
    months: "m ",
    years: "y ",
};

/**
 * Format a duration of milliseconds
 * @param {Number} ms milliseconds
 * @param {Object} [options={}] options for the format
 * @param {Boolean} [options.short=false] short or long names for units
 * @param {Number} [options.amount=3]
 * @returns {String} formatted duration
 */
export const formatDuration = (ms, options = {}) => {
    if (typeof ms !== "number") throw new TypeError("Ms needs to be a number.");
    if (typeof options !== "object") throw new TypeError("Options needs to be an object.");
    const short = options.short ?? false;
    const amount = options.amount ?? 3;
    if (typeof short !== "boolean") throw new TypeError("Options.short needs to be a boolean.");
    if (typeof amount !== "number") throw new TypeError("Options.amount needs to be an number.");

    // Math!
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

    return (
        Object.entries({
            years,
            months,
            days,
            hours,
            minutes,
            seconds,
        })
            // Filter times which are zeros
            .filter((t) => Boolean(t[1]))
            // Get as many largest units as specified by amount
            .slice(0, amount)
            // Format each unit
            .map(
                ([u, v]) =>
                    `${v}${
                        // Messy nested ternary to get the correct length of unit and in plural or singular form
                        // eslint-disable-next-line no-nested-ternary
                        short
                            ? v > 1
                                ? shorts[u].trim()
                                : shorts[u].substring(0, shorts[u].length - 1)
                            : ` ${v > 1 ? u : u.substring(0, u.length - 1)}`
                    }`
            )
            .join(", ")
    );
};

/**
 * Create a paginated embed for multiple pages of content
 * @param {Client} client the discord client
 * @param {CommandInteraction} command the command to reply to
 * @param {Array<MessageEmbed>} pages the pages of the embed
 * @param {MessageEmbed|null} [endpage=null] the page shown after time runs out
 * @param {Number} timeout time to be interactive in milliseconds
 * @returns
 */
export const paginatedEmbed = async (client, command, pages, endpage = null, timeout = 120_000) => {
    let page = 0;
    // Define the control buttons
    const controls = ["⬅️", "➡️", "❌"];
    // Edit or reply depending if the command has already been replied to
    if (command.deferred || command.replied) {
        await command.editReply({ embeds: [pages[page]] });
    } else {
        await command.reply({ embeds: [pages[page]] });
    }
    // Fetch the message
    const embedMsg = await command.fetchReply();

    // Add control emojis
    // eslint-disable-next-line no-await-in-loop
    for (let i = 0; i < controls.length; i += 1) await embedMsg.react(controls[i]);

    // Collector to interact with reaction
    const collector = embedMsg.createReactionCollector(
        // Filter out other users
        (reaction, user) => controls.includes(reaction.emoji.name) && user.id === command.user.id,
        {
            time: timeout,
            dispose: true,
        }
    );

    /**
     * Handle control clicks
     * @param {MessageReaction} reaction
     */
    const changePage = async (reaction) => {
        // Remove the reaction if sufficient permissions
        if (command.channel.permissionsFor(client.user.id).has("MANAGE_MESSAGES"))
            await reaction.users.remove(command.user);
        switch (reaction.emoji.name) {
            case controls[0]:
                // Decrease page number and edit new page
                page = page > 0 ? page - 1 : pages.length - 1;
                await embedMsg.edit({ embeds: [pages[page]] });
                break;
            case controls[1]:
                // Increase page number and edit new page
                page = page + 1 < pages.length ? page + 1 : 0;
                await embedMsg.edit({ embeds: [pages[page]] });
                break;
            case controls[2]:
                // Stop the collector and trigger the end event
                collector.stop();
                break;
            default:
        }
    };

    // Handle clicks on collect
    collector.on("collect", changePage);
    // Handle clicks on remove if no permissions to automatically remove
    if (!command.channel.permissionsFor(client.user.id).has("MANAGE_MESSAGES"))
        collector.on("remove", changePage);

    // Handle timeout or x button
    collector.on("end", async () => {
        // If the message is not deleted
        if (!embedMsg.deleted) {
            // Remove all reactions if having enough permissions
            if (command.channel.permissionsFor(client.user.id).has("MANAGE_MESSAGES"))
                await embedMsg.reactions.removeAll();
            // Edit the message with endpage if exists
            if (endpage !== null) {
                await embedMsg.edit(endpage);
            } else {
                // Otherwise edit current page footer to explain situation
                const modifiedPage = pages[page];
                modifiedPage.setFooter(
                    `${modifiedPage.footer.text} | This session has ended`,
                    modifiedPage.footer.iconURL
                );
                await embedMsg.edit({ embeds: [modifiedPage] });
            }
        }
    });

    return embedMsg;
};
