import { Message } from "discord.js";
import { ClientUser } from "discord.js";
import { Collection } from "discord.js";
import { MessageReaction } from "discord.js";
import { config } from "../models";

declare module 'discord.js' {
    interface Message {
        expire(prevMsg?: Message, keep?: boolean, expire?: number): void
        bin(prevMsg?: Message, expire?: boolean): void
    }

    interface Array<Message> {
        expire(prevMsg?: Message, keep?: boolean, expire?: number): void
        bin(prevMsg?: Message, expire?: boolean): void
    }
}


Message.prototype.expire = async function (prevMsg?: Message, keep?: boolean, expire: number = config.numerics.message_lifespan, deleter?: ClientUser) {
    prevMsg?.channel.stopTyping(true)
    const deleteReason = deleter ? `Deleted by ${deleter.username}` : `expiration timer ${expire}`;
    if (!keep) await this.delete({ timeout: expire, reason: deleteReason })
        .then(() => prevMsg?.delete().catch(() => null))
        .catch(() => null)
};



Message.prototype.bin = async function (prevMsg?: Message, expire?: boolean) {
    const binIcon = '⛔';
    const filter = (reaction: any, user: ClientUser) => {
        if (user.id === this.member.id) return false
        return reaction.emoji.name === binIcon && (
            user.id === prevMsg?.member.id ||
            user.lastMessage?.member.hasPermission("ADMINISTRATOR") ||
            config.bypass_list.includes(user.id)
        )
    };

    try { await this.react(binIcon) } catch (error) { }
    this.awaitReactions(filter, { max: 1 })
        .then(async (collected: Collection<String, MessageReaction>) => {
            const reaction = collected.last()
            const deleter = await reaction?.users.fetch().then(users => users.find(user => user.id !== this.author.id));

            if (reaction?.emoji.name === binIcon)
                this.expire(prevMsg, false, 1, deleter)
        });
    if (expire) {
        this.expire(prevMsg)
    }
}


