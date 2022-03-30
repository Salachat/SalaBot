import { sanulit } from "../db.js";

/**
 * @param {import("discord.js").Client} client
 * @param {import("discord.js").Message} newMessage
 */
export default async (client, newMessage) => {
    // Don't handle dms
    if (!newMessage.guild) return;
    let matches = newMessage.content.match(/Sanuli #(\d+) (\d)\/6/i);
    if (matches) {
        let nth = matches[1];
        let score = parseInt(matches[2], 10);
        let userid = newMessage.author.id;

        await sanulit.ensure(userid, {
            user: userid,
            guesses: {},
        });

        await sanulit.set(`${userid}.guesses.${nth}`, score);
    }
};
