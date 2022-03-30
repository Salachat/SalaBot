import { GuildChannel, GuildMember } from "discord.js";

/**
 * @typedef Config
 * @property {string} token
 * @property {string[]} admins
 * @property {string} devGuild
 * @property {boolean} skipSlashEnsure
 * @property {object} defaultSettings
 * @property {object} defaultSettings.log
 * @property {object} defaultSettings.logs
 * @property {boolean} defaultSettings.logs.join
 * @property {boolean} defaultSettings.logs.leave
 * @property {boolean} defaultSettings.logs.delete
 * @property {boolean} defaultSettings.logs.edit
 * @property {object[]} perms
 * @property {boolean} perms[].guildOnly
 * @property {function(import("discord.js").CommandInteraction): boolean} perms[].check
 */

/** @type Config */
const config = {
    // Bot token
    token: "",
    // Array of ids which should have access to everything
    admins: [],
    // Guild to create slash commands in when in development environment
    devGuild: "",
    // Way to skip ensuring commands in production
    skipSlashEnsure: false,
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
                if (
                    !(command.channel instanceof GuildChannel) ||
                    !(command.member instanceof GuildMember)
                )
                    return false;
                try {
                    return command.channel.permissionsFor(command.member).has("ADMINISTRATOR");
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
