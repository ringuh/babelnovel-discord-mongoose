import { Message } from 'discord.js';
import { config } from '../models';
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

export function botPermission(message: Message, permissions: string | string[], reply: boolean = true): boolean {
    if (!permissions) return true
    if (typeof (permissions) === "string")
        permissions = [permissions]

    // @ts-ignore
    const botPermissionsFor = message.channel.permissionsFor(message.guild.me)
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
