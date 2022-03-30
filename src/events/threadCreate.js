/**
 * @param {import("discord.js")} client
 * @param {import("discord.js").ThreadChannel} thread
 */
export default async (client, thread) => {
    // Auto join threads for moderative reasons
    await thread.join();
};
