import { Message } from "discord.js";
import { isAdmin, usageMessage } from '../../funcs/commandTools';
import { TextChannel } from 'discord.js';
import { getCommands } from "../../funcs/commandRestrictions";
import { StripMentions } from "../../funcs/mentions";
import { CommandRestriction } from "../../models";
import { CommandRestrictionType } from "../../models/enums/restriction.enum";


enum BlacklistTypes {
    reset = "reset",
    server = "server"
}

export default {
    name: ['whitelist'],
    description: 'Whitelists command/commands from this channel or multiple channels (admin)',
    args: `[command] [#channel1...#channelN] [${Object.keys(BlacklistTypes).map(key => `'${key}'`).join(" / ")}]`,
    async execute(message: Message, args: string[], params: string[]) {
        if (!isAdmin(message, true)) return false
        if (args.length < 1) return usageMessage(message, this)
        const commands = getCommands();
        const lastArg = BlacklistTypes[args.last().toLowerCase()];
        if (lastArg) args.pop();

        const [text, users, channels, roles] = StripMentions(args, message.guild);
        if (!text) return usageMessage(message, this)           

        const acceptedCommands = text.split(" ").map(cmd => cmd.toLowerCase()).filter(cmd => commands.includes(cmd));

        if (!channels.length) channels.push(<TextChannel>message.channel);

        acceptedCommands.forEach(async command => {
            // whitelist command for whole server
            if (lastArg && lastArg === BlacklistTypes.server) {
                const commandExists = await CommandRestriction.findOneAndUpdate({ server: message.guild.id, command: command, channel: null }, { type: CommandRestrictionType.whitelist })
                const commandCreated = commandExists || await CommandRestriction.create({ server: message.guild.id, type: CommandRestrictionType.whitelist, command: command }).catch(err => console.error);
                if (commandCreated) return message.channel.send(`'${command}' is whitelisted on whole server`, { code: true }).then(msg => msg.expire(message))
                return false
            } else if (lastArg && lastArg === BlacklistTypes.reset) {
                return await CommandRestriction.findOneAndDelete({ server: message.guild.id, type: CommandRestrictionType.whitelist, command: command, channel: null }).then(command =>
                    message.channel.send(`'${command}' isn't whitelisted on server scale`, { code: true }).then(msg => msg.expire(message))
                ).catch(err => console.error);
            }
            // whitelist by channel

            channels.forEach(async channel => {
                if (lastArg && lastArg === BlacklistTypes.reset) {
                    return await CommandRestriction.findOneAndDelete({ server: message.guild.id, type: CommandRestrictionType.whitelist, command: command, channel: channel.id }).then(command =>
                        message.channel.send(`'${command}' isn't whitelisted on #${channel.name}`, { code: true }).then(msg => msg.expire(message))
                    ).catch(err => console.error);
                }

                const commandExists = await CommandRestriction.findOneAndUpdate({ server: message.guild.id, command: command, channel: channel.id }, { type: CommandRestrictionType.whitelist })
                const commandCreated = commandExists || await CommandRestriction.create({ server: message.guild.id, type: CommandRestrictionType.whitelist, command: command, channel: channel.id }).catch(err => console.error);
                if (commandCreated) return message.channel.send(`'${command}' is whitelisted on #${channel.name}`, { code: true }).then(msg => msg.expire(message))
            })

        })

    }
};





