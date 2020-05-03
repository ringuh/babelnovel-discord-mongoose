import { config } from './models';
import { Client, Collection, Message } from 'discord.js';
import fs from 'fs';
import path from 'path';

import { botPermission } from './funcs/commandTools';
import './extensions'
import { launchBrowser } from './babel/headlessChrome';

const client = new Client();
const commands = new Collection();




const loadCommands = (filePath: string) => {
    const folders = fs.readdirSync(filePath, { withFileTypes: true }).filter(file => file.isDirectory());
    const commandFiles = fs.readdirSync(filePath, { withFileTypes: true }).filter(file => file.name.endsWith('.ts'));
    for (const file of commandFiles) {
        const command = require(path.join(filePath, file.name)).default;
        command.name?.forEach((al: string) => commands.set(al, command))
    }
    folders.forEach(folder => loadCommands(require('path').join(filePath, folder.name)))
};
loadCommands(path.join(__dirname, "commands"))

client.on('message', message => {
    // ignore non-prefix and other bots excluding REPEAT BOT 621467973122654238
    if (message.channel.type !== "text" ||
        !message.content.startsWith(config.prefix) ||
        (message.author.bot &&
            (!config.bypass_bots.includes(message.author.id)
                || message.author.id === client.user.id
            )
        )
    )
        return;
    // mobile discord wants to offer ! command instead of !command
    if (message.content.startsWith(`${config.prefix} `))
        message.content = message.content.replace(`${config.prefix} `, config.prefix)

    let args = message.content.slice(config.prefix.length).split(/ +/);
    let parameters = []
    if (args.includes("|"))
        parameters = args.splice(args.indexOf("|"), args.length).slice(1)
    const command = args.shift().toLowerCase();
    if (!commands.has(command)) return;

    args.map(arg => {
        if (arg.startsWith("--")) {
            parameters.push(arg.substr(2))
            return null
        }
        return arg
    }).filter(arg => arg)

    try {
        let cmd: any = commands.get(command)
        if (botPermission(message, cmd.permissions))
            cmd.execute(message, args, parameters);
    } catch (error) {
        console.error(error.message);
        message.reply(`Error: ${error.message}`);
    }
});


client.once('ready', async () => {
    console.log('Discord bot running!');
    await launchBrowser(true);

});

client.login(config.discord_token).catch(err => console.log(err.message))
setInterval(async () => await launchBrowser(true), 60000);
