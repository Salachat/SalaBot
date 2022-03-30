/**
 * @typedef Command
 * @property {object} data
 * @property {import("discord.js").ChatInputApplicationCommandData} data.slash
 * @property {boolean} data.guildOnly
 * @property {number} data.permission
 * @property {function(import("discord.js").Client, import("discord.js").CommandInteraction): Promise<void>} execute
 */

/**
 * @typedef Container
 * @property {import("discord.js").Collection<string, Command>} commands
 */

/** @type Container */
// @ts-expect-error
export default {};
