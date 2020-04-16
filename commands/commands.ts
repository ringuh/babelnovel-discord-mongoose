import { config } from '../models';
import { botPermission } from '../funcs/commandTools';
import path from 'path';
import { Message } from 'discord.js';
import '../extensions/message.extension';
export default {
    name: ['cmds'],
    description: 'Lists available commands',
    args: false,
    execute(message: Message) {
        var reply = [`Available ${config.prefix}${this.name[0]}:`]
        const dirs = (filePath) => {
            var replies = []
            const folders = require('fs').readdirSync(filePath, { withFileTypes: true }).filter(file => file.isDirectory() && file.name !== 'hidden');
            const commandFiles = require('fs').readdirSync(filePath, { withFileTypes: true }).filter(file => file.name.endsWith('.ts'));

            for (const file of commandFiles) {
                const cmd = require(path.join(filePath, file.name)).default;
                if (!cmd.hidden && botPermission(message, cmd.permissions, false))
                    replies.push(`${config.prefix}${cmd.name.join(" / ")} ${cmd.args ? cmd.args + " //" : '//'} ${cmd.description}`)
            }

            folders.forEach(folder => {
                let r = dirs(require('path').join(filePath, folder.name))
                if (r.length) replies = [...replies, "", folder.name, "-------", ...r]
            })
            return replies
        };

        reply = [...reply, ...dirs(__dirname)]

        message.channel.send(reply.join("\n"), { code: "js" }).then()

    },
};