import { Message } from "discord.js";
import { StripMentions } from "../../funcs/mentions";
import { getCommands } from "../../funcs/commandRestrictions";
import { isAdmin, usageMessage } from '../../funcs/commandTools';
import { TextChannel } from 'discord.js';
import { CommandRestrictionType } from '../../models/enums/restriction.enum';
import { CommandRestriction } from "../../models";

enum BlacklistTypes {
    reset = "reset",
    server = "server"
}

export default {
    name: ['blacklist'],
    description: 'Blacklists command/commands from this channel or multiple channels (admin)',
    args: `[command] [#channel1...#channelN] [${Object.keys(BlacklistTypes).map(key => `'${key}'`).join(" / ")}]`,
    async execute(message: Message, args: string[], params: string[]) {
        if (!isAdmin(message, true)) return false
        if (args.length < 1) return usageMessage(message, this)
        const commands = getCommands();
        const lastArg = BlacklistTypes[args.last().toLowerCase()];
        if (lastArg) args.pop();

        const [text, users, channels, roles] = StripMentions(args, message.guild);
        if (!text && !lastArg) return usageMessage(message, this)


        // serverside settings
        if (!text && lastArg === BlacklistTypes.reset) {
            // remove blacklist commands on default for whole server
            await CommandRestriction.findOneAndDelete({ server: message.guild.id, type: CommandRestrictionType.blacklist, command: null, channel: null }).then(command =>
                message.channel.send(`Blacklisting all commands by default: OFF`, { code: true }).then(msg => msg.expire(message))
            ).catch(err => console.error);
        } else if (!text && lastArg === BlacklistTypes.server) {
            // blacklist commands on default for whole server
            const commandExists = await CommandRestriction.findOneAndUpdate({ server: message.guild.id, command: null, channel: null }, { type: CommandRestrictionType.blacklist })
            const commandCreated = commandExists || await CommandRestriction.create({ server: message.guild.id, type: CommandRestrictionType.blacklist, }).catch(err => console.error);
            if (commandCreated) return message.channel.send(`Blacklisting all commands by default: ON`, { code: true }).then(msg => msg.expire(message))
        }

        const acceptedCommands = text.split(" ").map(cmd => cmd.toLowerCase()).filter(cmd => commands.includes(cmd));

        if (!channels.length) channels.push(<TextChannel>message.channel);

        acceptedCommands.forEach(async command => {
            console.log(command)
            // blacklist command for whole server
            if (lastArg && lastArg === BlacklistTypes.server) {
                const commandExists = await CommandRestriction.findOneAndUpdate({ server: message.guild.id, command: command, channel: null }, { type: CommandRestrictionType.blacklist })
                const commandCreated = commandExists || await CommandRestriction.create({ server: message.guild.id, type: CommandRestrictionType.blacklist, command: command }).catch(err => console.error);
                if (commandCreated) return message.channel.send(`'${command}' is blacklisted on whole server`, { code: true }).then(msg => msg.expire(message))
                return false
            } else if (lastArg && lastArg === BlacklistTypes.reset) {
                return await CommandRestriction.findOneAndDelete({ server: message.guild.id, type: CommandRestrictionType.blacklist, command: command, channel: null }).then(command =>
                    message.channel.send(`'${command}' isn't blacklisted on server scale`, { code: true }).then(msg => msg.expire(message))
                ).catch(err => console.error);
            }
            // blacklist by channel

            channels.forEach(async channel => {
                console.log(channel.name)

                if (lastArg && lastArg === BlacklistTypes.reset) {
                    return await CommandRestriction.findOneAndDelete({ server: message.guild.id, type: CommandRestrictionType.blacklist, command: command, channel: channel.id }).then(command =>
                        message.channel.send(`'${command}' isn't blacklisted on #${channel.name}`, { code: true }).then(msg => msg.expire(message))
                    ).catch(err => console.error);
                }

                const commandExists = await CommandRestriction.findOneAndUpdate({ server: message.guild.id, command: command, channel: channel.id }, { type: CommandRestrictionType.blacklist })
                const commandCreated = commandExists || await CommandRestriction.create({ server: message.guild.id, type: CommandRestrictionType.blacklist, command: command, channel: channel.id }).catch(err => console.error);
                if (commandCreated) return message.channel.send(`'${command}' is blacklisted on #${channel.name}`, { code: true }).then(msg => msg.expire(message))
            })

        })

    }
};





