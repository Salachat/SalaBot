import { readdir } from "fs/promises";

/**
 * Load events and commands to a client
 * @param {Client} client
 */
const load = async (client) => {
    console.log("Loading events...");
    // List all event files and wait for them to load
    const eventFiles = await readdir("./src/events/");
    await Promise.all(
        // Loop all files
        eventFiles.map(async (f) => {
            const eventName = f.split(".")[0];
            console.log(`Loading event "${eventName}"`);
            try {
                // Dynamically import
                const event = (await import(`./events/${f}`)).default;
                // Bind it to the client
                client.on(eventName, event.bind(null, client));
            } catch (e) {
                console.error(`Failed to load event "${eventName}"\n${e}`);
            }
        })
    );
    console.log("Events loaded!");

    console.log("Loading commands...");
    client.commands = new Map();
    // List all categories and wait for them to load
    const cmdCategories = await readdir("./src/commands");
    await Promise.all(
        // Loop all categories
        // (Categories are unnecessary but keep project's structure clean)
        cmdCategories.map(async (cat) => {
            // Read command files in category and wait for them to load
            const cmdFiles = await readdir(`./src/commands/${cat}`);
            await Promise.all(
                cmdFiles.map(async (f) => {
                    const commandName = f.split(".")[0];
                    console.log(`Loading command "${commandName}"`);
                    try {
                        // Dynamically import
                        const command = (await import(`./commands/${cat}/${f}`)).default;
                        // Save the handler in a Map
                        client.commands.set(commandName, command);
                    } catch (e) {
                        console.error(`Failed to load command "${commandName}"\n${e}`);
                    }
                })
            );
        })
    );
    console.log("Commands loaded!");
};

export default load;
