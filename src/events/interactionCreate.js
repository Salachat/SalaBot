import button from "../interactions/button.js";
import command from "../interactions/command.js";
import selectMenu from "../interactions/selectMenu.js";

export default (client, interaction) => {
    // Check what type of interaction it is and route it to the correct handler
    if (interaction.isCommand()) command(client, interaction);
    else if (interaction.isButton()) button(client, interaction);
    else if (interaction.isSelectMenu()) selectMenu(client, interaction);
};
