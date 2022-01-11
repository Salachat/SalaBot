import bent from "bent";
import { XMLParser } from "fast-xml-parser";
import he from "he";

const parser = new XMLParser();

/**
 * Parse a RSS feed
 * @param {String} data raw xml data
 * @returns {Object} complex object containing the feed items
 */
export const parseFeed = (data) => {
    // Way too complex of a regex to expand link xml fields so that the parsers understands them
    const pre = data.replace(
        /<[^ <]+? (?:[^ =]+?="[^"]+?" )*?(?:src|href|url)="[^"]+?"(?: [^ =]+?="[^"]+?")*? ?\/>/gi,
        (match) => {
            const [, type, url] = match.match(
                /<([^ <]+?) (?:[^ =]+?="[^"]+?" )*?(?:src|href|url)="([^"]+?)"(?: [^ =]+?="[^"]+?")*? ?\/>/i
            );
            return `<${type}>${url}</${type}>`;
        }
    );
    // Parse
    const parsed = parser.parse(pre);
    // Either get RSS items or Atom entries
    const items = parsed?.rss?.channel?.item ?? parsed?.feed?.entry;
    // Throw error on not items
    if (!items) {
        throw new Error("No feed items found");
    }
    // Always return an array
    return Array.isArray(items) ? items : [items];
};

/**
 * Fetch a feed
 * @param {String} url RSS feed url
 * @param {Boolean} [raw=false] don't parse data
 * @returns {Object} parsed feed items or raw data
 */
export const fetchFeed = async (url, raw = false) => {
    let data;
    try {
        // Fetch feed
        data = await bent("GET", url, "string")();
    } catch (e) {
        throw new Error(`Feed url threw unexpected "${e.message}"`);
    }
    // Return raw or parse
    return raw ? data : parseFeed(data);
};

/**
 * Simply test object equality with JSON.stringify()
 * @param {Object} obj1
 * @param {Object} obj2
 * @returns {Boolean} result
 */
const simpleObjEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);

/**
 * Compared two arrays of data and find the new items in the second one
 * @param {Array<Object>} oldData data to compare to
 * @param {Array<Object>} newData data to find entries from
 * @returns {Array<Object>} the new entries
 */
export const findNewEntries = (oldData, newData) =>
    // Use array reduce to reduce newData into a smaller array which fills the condition
    newData.reduce(
        (newItems, current) =>
            // push the current item into the returned array
            // if its not equal to any entry in the oldData
            !oldData.find((item) => simpleObjEqual(item, current))
                ? newItems.concat(current)
                : newItems,
        []
    );

/**
 * Parse a timestamp and return it as Discord markdown
 * @param {Number} raw some datetime in some format
 * @returns {String} Discord markdown for that datetime
 */
const formatPubDate = (raw) => {
    // Parse date
    const parsed = Date.parse(raw);
    // Throw error if parsing failed
    if (Number.isNaN(parsed)) throw new Error("Invalid date");
    // Return markdown
    return `<t:${Math.round(parsed / 1000)}>`;
};

/**
 * Extract the simple keys and values of complex objects
 * @param {Object} entry RSS feed entry
 * @returns {Array<Array<String, String>>}
 */
export const getPlaceholders = (entry) =>
    Object.entries(entry)
        .reduce((placeholders, [key, val]) => {
            if (typeof val === "string") {
                // If the value is a string, decode html entities and add to placeholders
                placeholders.push([key, he.decode(val)]);
            } else {
                // Otherwise recursively get the sub placeholders
                const subplaceholders = getPlaceholders(val);
                // And prefix them with current key before adding to placeholders
                subplaceholders.forEach(([subkey, subval]) => {
                    placeholders.push([`${key}:${subkey}`, subval]);
                });
            }
            return placeholders;
            // Filter out non strings
        }, [])
        .filter(([, v]) => typeof v === "string");

/**
 * Replace placeholders in a text
 * @param {Object} entry the object to get data from
 * @param {String} text the text with placeholders
 * @returns {String} filled text
 */
const replacePlaceholders = (entry, text) => {
    // Get placeholders for current entry
    const placeholders = getPlaceholders(entry);
    // Use regex to find placeholders and then replace them
    return text.replace(/{.*?}/g, (m) => {
        // Remove {}'s to get the key
        const key = m.substring(1, m.length - 1);
        // Try to find it from the array
        const placeholder = placeholders.find((ph) => ph[0] === key)?.[1];
        // If the key is one of these, format it as a datetime
        if (["pubDate", "published", "updated"].includes(key) && placeholder)
            return formatPubDate(placeholder);
        // Return a newline on the custom placeholder
        if (key === "newline") return "\n";
        // Return the found placeholder or the original match
        return placeholder ?? m;
    });
};

/**
 * Just a shorthand for {@link replacePlaceholders}
 * @param {Object} entry the object to get data from
 * @param {String} text the text with placeholders
 * @returns {String} filled text
 */
const formatPostText = (entry, text) => replacePlaceholders(entry, text);

/**
 * Format a embed format specific by user with placeholders from RSS feed entry
 * @param {Object} entry the RSS feed entry
 * @param {Object} embed user specified format
 * @returns {APIEmbed} valid embed to be passed to Discord
 */
const formatPostEmbed = (entry, embed) => {
    // Filter out empty embed fields
    const fields = Object.entries(embed).filter((field) => field[1] !== "{empty}");
    // Prepare a embed object
    const formattedEmbed = {};
    fields.forEach(([property, value]) => {
        // Replace placeholders in the value
        const formattedValue = replacePlaceholders(entry, value);
        // As properties are formatted like "footer-icon_url"
        // Split it into paths
        const path = property.split("-");
        // Didnt want to implement full on path travelsal thing
        // Because only two lengths are possible
        // Used a switch statement
        switch (path.length) {
            case 1:
                // Just set the path to the value
                formattedEmbed[path[0]] = formattedValue;
                break;
            case 2:
                // Create the object layer if it doesn't exists
                if (!formattedEmbed[path[0]]) formattedEmbed[path[0]] = {};
                // And set the path inside that to the value
                formattedEmbed[path[0]][path[1]] = formattedValue;
                break;
            default:
                // This should never occur but throw a error anyway
                throw new Error("Unexpected embed path");
        }
    });
    // Return the embed with all placeholders replaced
    return formattedEmbed;
};

/**
 * Create a valid message object from RSS feed entry and user specified embed and text formats
 * @param {Object} entry the RSS feed entry
 * @param {Object} format user specified format
 * @returns {BaseMessageOptions} valid message to be passed to Discord
 */
export const formatPost = (entry, format) => {
    // Prepare the valid message object
    const msg = {};
    // Add and format the the text content if it is not empty
    if (format.text !== "{empty}") msg.content = formatPostText(entry, format.text);
    // Add and format an embed if there is non empty fields
    if (Object.values(format.embed).some((field) => field !== "{empty}"))
        msg.embeds = [formatPostEmbed(entry, format.embed)];
    // Throw an error if there were no valid fields
    if (Object.keys(msg).length === 0) throw new Error("No valid non empty properties set");
    // Return the message object which has been formed
    return msg;
};
