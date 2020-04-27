import { Message } from 'discord.js';
import { config } from '../models';
import { TextChannel } from 'discord.js';
import { PermissionString } from 'discord.js';
const { bypass_list } = config;


export function isAdmin(message: Message, sendReply: boolean = true): boolean {
    if (!message.member.hasPermission("ADMINISTRATOR") &&
        !bypass_list.includes(message.member.id)) {
        if (sendReply)
            message.channel.send(`Admin access required`, { code: true })
                .then((msg: Message) => msg.expire(message))
        return false
    }
    return true
};

export function isBypass(message: Message): boolean {
    return bypass_list.includes(message.member.id)
}

export function usageMessage(message: Message, command: any): void {
    message.channel.send(
        `Usage: ${config.prefix}${command.name[0]} ${command.args ? command.args : ''}`,
        { code: true }
    ).then((msg: Message) => msg.expire(message))
};

export function botPermission(message: Message, permissions: PermissionString[], reply: boolean = true): boolean {
    if (!permissions) return true
    
    const channel: TextChannel = message.channel.type === 'text' ? message.channel: null;
    const botPermissionsFor = channel.permissionsFor(message.guild.me)
    if (botPermissionsFor.has('ADMINISTRATOR')) return true

    const response = !permissions.some(permission => {
        if (!botPermissionsFor.has(permission)) {
            if (reply)
                message.channel.send(
                    `Bot is missing permission ${permission}`, { code: true }
                ).then((msg: Message) => msg.expire(message))
            return true
        }
    })

    return response
}
