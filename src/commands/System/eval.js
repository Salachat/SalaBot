import { performance } from "perf_hooks";
import { cleanEvalResponse, formatEvalMs } from "../../util.js";

export default {
    // Object of command data
    data: {
        // Data used to create the slash command
        slash: {
            name: "eval",
            description: "Bot admin command for debugging",
            options: [
                {
                    name: "code",
                    description: "Javascript to evaluate",
                    type: "STRING",
                    required: true,
                },
                {
                    name: "silent",
                    description: "Show the output only to yourself",
                    type: "BOOLEAN",
                    required: false,
                },
                {
                    name: "await",
                    description: "Await the result of the code",
                    type: "BOOLEAN",
                    required: false,
                },
                {
                    name: "async",
                    description: "Wrap the input inside an async function, enabling await",
                    type: "BOOLEAN",
                    required: false,
                },
            ],
        },
        // User permission level to use the command
        permission: 2,
        guildOnly: false,
    },
    // Keep client as unused variable because eval code might need it
    execute: async (client, command) => {
        // Get options and apply defaults
        const code = command.options.getString("code");
        const silent = command.options.getBoolean("silent") ?? false;
        const useAwait = command.options.getBoolean("await") ?? false;
        const useAsync = command.options.getBoolean("async") ?? false;

        // Defer for tasks that take longer
        // Hide if silent is true
        await command.defer({ ephemeral: silent });

        try {
            // Wrap code in async function if async is enabled
            const wrappedCode = useAsync ? `(async()=>{\n${code}\n})();` : code;
            let res;
            let diff;
            // Await the eval if await is enabled
            if (useAwait) {
                // Start time measuring
                const start = performance.now();
                // eslint-disable-next-line no-eval
                res = await eval(wrappedCode);
                // Calculate time it took to execute
                diff = performance.now() - start;
            } else {
                // Start time measuring
                const start = performance.now();
                // eslint-disable-next-line no-eval
                res = eval(wrappedCode);
                // Calculate time it took to execute
                diff = performance.now() - start;
            }
            // Reply with formatted result and time
            await command.editReply({
                content: `**SUCCESS**\n\`\`\`js\n${cleanEvalResponse(
                    res
                )}\n\`\`\`\n**Executed in**\n\`${formatEvalMs(diff)}\``,
            });
        } catch (e) {
            // Catch error and reply with it
            await command.editReply({
                content: `**ERROR**\n\`\`\`js\n${e.toString().substring(0, 1900)}\n\`\`\``,
            });
        }
    },
};
