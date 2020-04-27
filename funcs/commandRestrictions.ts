import path from "path";
import fs from 'fs';
import { Message } from "discord.js";
import { CommandRestrictionType } from "../models/enums/restriction.enum";
import { isAdmin } from "./commandTools";
import { config, CommandRestriction } from "../models";


async function commandRestricted(message: Message, command: string) {
    const serverRestriction = await CommandRestriction.findOne({ server: message.guild.id, command: null });
    const commandServerRestriction = await CommandRestriction.findOne({ server: message.guild.id, command: command.toLowerCase(), channel: null });
    const commandChannelRestriction = await CommandRestriction.findOne({ server: message.guild.id, command: command.toLowerCase(), channel: message.channel.id });

    let canPass = true;
    if (isAdmin(message)) return true;
    if (commandChannelRestriction) canPass = commandChannelRestriction.type !== CommandRestrictionType.blacklist;
    else if (commandServerRestriction) canPass = commandServerRestriction.type !== CommandRestrictionType.blacklist;
    else if (serverRestriction) canPass = false;
    
    if (!canPass) message.channel.send(`'${config.prefix}${command}' is disabled on this channel. Try somewhere else.`, { code: true }).then(msg => msg.expire(message))
    return canPass
}

const getCommands = () => {
    const commands = [];
    const loadCommands = (filePath: string) => {
        const folders = fs.readdirSync(filePath, { withFileTypes: true }).filter(file => file.isDirectory());
        const commandFiles = fs.readdirSync(filePath, { withFileTypes: true }).filter(file => file.name.endsWith('.ts'));
        for (const file of commandFiles) {
            const command = require(path.join(filePath, file.name)).default;
            commands.push(command.name);
        }
        folders.forEach(folder => loadCommands(require('path').join(filePath, folder.name)))
    };
    loadCommands(path.join(__dirname, "../commands"))

    return commands.flat();
}


export { getCommands, commandRestricted }