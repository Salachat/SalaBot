import { sanulit } from "../db.js";

/**
 * @param {import("discord.js").Client} client
 * @param {import("discord.js").Message} newMessage
 */
export default async (client, newMessage) => {
    // Don't handle dms
    if (!newMessage.guild) return;
    const matches = newMessage.content.match(/^Sanuli #(\d+) ([123456X])\/6/m);
    if (matches) {
        const nth = matches[1];
        const score = parseInt(matches[2], 10);
        const userid = newMessage.author.id;

        await sanulit.ensure(userid, {
            user: userid,
            guesses: {},
        });

        if ((await sanulit.get(`${userid}.guesses.${nth}`)) != null) {
            await newMessage.reply(`You dumb bitch, you already submitted today!`);
            return;
        }

        await sanulit.set(`${userid}.guesses.${nth}`, Number.isNaN(score) ? -1 : score);
    }
};
