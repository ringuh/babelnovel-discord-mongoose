import { Message } from "discord.js";
import { User } from "discord.js";
import { isAdmin } from "../funcs/commandTools";
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

Message.prototype.expire = async function (prevMsg?: Message, keep?: boolean, expire: number = config.numerics.epub_lifespan_seconds) {
    if (prevMsg) {
        prevMsg.channel.stopTyping(true)
        if (!keep) await prevMsg.delete({ timeout: expire, reason: 'scheduled' }).catch(() => null)
    }
    if (!keep) await this.delete(expire).catch(() => null)
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
        .then((collected: Collection<String, MessageReaction>) => {
            const reaction = collected.first()
            if (reaction.emoji.name === binIcon)
                this.expire(prevMsg, false, 1)
        });
    if (expire) {
        this.expire(prevMsg)
    }
}

