import ensureSlash from "../ensureSlash.js";

export default async (client) => {
    // Had to wait for client to load to began loading slash commands
    await ensureSlash(client);

    console.log(`Online as ${client.user.tag} in ${process.env.NODE_ENV} mode!`);
};
