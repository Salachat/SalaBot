/**
 * @param {import("discord.js").Guild} guild
 */
export default async (_, guild) => {
    console.log(`Left guild ${guild.name} (${guild.id})`);
};
