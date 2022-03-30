/**
 * @param {import("discord.js").Guild} guild
 */
export default async (_, guild) => {
    console.log(`Joined guild ${guild.name} (${guild.id})`);
};
