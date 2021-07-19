import bent from "bent";
import parser from "fast-xml-parser";

// TODO: atom support (reddit for example)
export const parseFeed = (data) => {
    const parsed = parser.parse(data);
    const items = parsed?.rss?.channel?.item;
    if (!items) {
        throw new Error("No feed items found");
    }
    return Array.isArray(items) ? items : [items];
};

export const fetchFeed = async (url, raw = false) => {
    let data;
    try {
        data = await bent("GET", url, "string")();
    } catch (e) {
        throw new Error(`Feed url threw unexpected "${e.message}"`);
    }
    return raw ? data : parseFeed(data);
};

const simpleObjEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);

export const findNewEntries = (oldData, newData) =>
    newData.reduce(
        (newItems, current) =>
            !oldData.find((item) => simpleObjEqual(item, current))
                ? newItems.concat(current)
                : newItems,
        []
    );

const formatPubDate = (raw) => {
    const parsed = Date.parse(raw);
    if (Number.isNaN(parsed)) throw new Error("Invalid date");
    return `<t:${Math.round(parsed / 1000)}>`;
};

const replacePlaceholders = (entry, text) => {
    const placeholders = Object.entries(entry).filter(([, v]) => typeof v === "string");
    return text.replace(/{.*?}/g, (m) => {
        const key = m.substring(1, m.length - 1);
        const placeholder = placeholders.find((ph) => ph[0] === key)?.[1];
        if (key === "pubDate" && placeholder) return formatPubDate(placeholder);
        if (key === "newline") return "\n";
        return placeholder ?? m;
    });
};

const formatPostText = (entry, text) => replacePlaceholders(entry, text);

const formatPostEmbed = (entry, embed) => {
    const fields = Object.entries(embed).filter((field) => field[1] !== "{empty}");
    const formattedEmbed = {};
    fields.forEach(([property, value]) => {
        const formattedValue =
            typeof value === "string" ? replacePlaceholders(entry, value) : value;
        const path = property.split("-");
        switch (path.length) {
            case 1:
                formattedEmbed[path[0]] = formattedValue;
                break;
            case 2:
                if (!formattedEmbed[path[0]]) formattedEmbed[path[0]] = {};
                formattedEmbed[path[0]][path[1]] = formattedValue;
                break;
            default:
                throw new Error("Unexpected embed path");
        }
    });
    return formattedEmbed;
};

export const formatPost = (entry, format) => {
    const msg = {};
    if (format.text !== "{empty}") msg.content = formatPostText(entry, format.text);
    if (Object.values(format.embed).some((field) => field !== "{empty}"))
        msg.embeds = [formatPostEmbed(entry, format.embed)];
    if (Object.keys(msg).length === 0) throw new Error("No valid non empty properties set");
    return msg;
};
