import Josh from "@joshdb/core";
import provider from "@joshdb/sqlite";

/**
 * @typedef Settings
 * @property {object} log
 * @property {object} logs
 * @property {boolean} logs.join
 * @property {boolean} logs.leave
 * @property {boolean} logs.delete
 * @property {boolean} logs.edit
 */

// Export the database for guild settings
/** @type {Josh<Settings>} */
export const settings = new Josh({
    name: "settings",
    provider,
});

/**
 * @typedef Feed
 * @property {string} title
 * @property {string} url
 * @property {string} cid
 * @property {string} fid
 * @property {object} filter
 * @property {string[]} filter.positive
 * @property {string[]} filter.negative
 * @property {import("./rss/rssUtil").RSSFormat} format
 * @property {any} oldData
 * @property {number} errorCount
 */

/**
 * @typedef RSS
 * @property {string} gid
 * @property {Record<string, Feed>} feeds
 * @property {number} autoNum
 */

// Export a seperate database for RSS feeds
/** @type {Josh<RSS>} */
export const rss = new Josh({
    name: "rss",
    provider,
});

/**
 * @typedef Sanuli
 * @property {string} user
 * @property {Record<string, number>} guesses
 */
/** @type {Josh<Sanuli>} */
export const sanulit = new Josh({
    name: "sanulit",
    provider,
});
