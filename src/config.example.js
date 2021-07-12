const config = {
    // Bot token
    token: "",
    // Array of ids which should have access to everything
    admins: [],
    // Guild to create slash commands in when in development environment
    devGuild: "",
    // The default settings for guild settings
    defaultSettings: {
        log: null,
        logs: {
            join: false,
            leave: false,
            delete: false,
            edit: false,
        },
    },
    // Permission resolvers
    perms: [
        // Level 0: users, always true
        {
            guildOnly: false,
            check: () => true,
        },
        // Level 1: guild admins, only in guilds, people who have the administrator permission
        {
            guildOnly: true,
            check: (command) => {
                try {
                    return command.member.hasPermission("ADMINISTRATOR");
                } catch (e) {
                    return false;
                }
            },
        },
        // Level 2: bot admins, people listed in the admins array of this file
        {
            guildOnly: false,
            check: (command) => config.admins.includes(command.user.id),
        },
    ],
};

export default config;
