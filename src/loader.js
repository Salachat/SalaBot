import { readdir } from "fs/promises";

const load = async (client) => {
    console.log("Loading events...");
    const evtFiles = await readdir("./src/events/");
    evtFiles.forEach(async (f) => {
        if (!f.endsWith(".js")) return;
        try {
            const eventName = f.split(".")[0];
            console.log(`Loading event "${eventName}"`);
            const event = (await import(`./events/${f}`)).default;
            client.on(eventName, event.bind(null, client));
        } catch (e) {
            console.error(`Failed to load event ${f.split(" ")[0]}\n${e}`);
        }
    });
    console.log("Events loaded!");
};

export default load;
