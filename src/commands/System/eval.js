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
    },
    execute: async (client, command) => {
        // Get options and apply defaults
        const code = command.options.get("code").value;
        const silent = command.options.get("silent")?.value ?? false;
        const useAwait = command.options.get("await")?.value ?? false;
        const useAsync = command.options.get("async")?.value ?? false;

        try {
            const wrappedCode = useAsync ? `(async()=>{\n${code}\n})();` : code;
            let res;
            let diff;
            if (useAwait) {
                const start = performance.now();
                // eslint-disable-next-line no-eval
                res = await eval(wrappedCode);
                diff = performance.now() - start;
            } else {
                const start = performance.now();
                // eslint-disable-next-line no-eval
                res = eval(wrappedCode);
                diff = performance.now() - start;
            }
            command.reply({
                content: `**SUCCESS**\n\`\`\`js\n${cleanEvalResponse(
                    res
                )}\n\`\`\`\n**Executed in**\n\`${formatEvalMs(diff)}\``,
                ephemeral: silent,
            });
        } catch (e) {
            command.reply({
                content: `**ERROR**\n\`\`\`js\n${e.toString().substring(0, 1900)}\n\`\`\``,
                ephemeral: silent,
            });
        }
    },
};
