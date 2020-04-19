import { Message } from "discord.js";
import { Collection } from "discord.js";

const { isAdmin, usageMessage } = require('../funcs/commandTools')

export default {
    name: ['clear'],
    description: 'Clears comments (admin)',
    args: "[comment_id] [+-count]",
    permissions: ["MANAGE_MESSAGES"],
    async execute(message: Message, args: string[]) {
        if (!isAdmin(message, true)) return false
        if (args.length < 1) return usageMessage(message, this)

        const msg_id = args[0].length > 10 ? args[0] : null
        const last_arg: string = args[args.length - 1]
        if (last_arg.length > 10) return usageMessage(message, this)
        let count = last_arg.length > 10 ? 0 : Math.abs(parseInt(last_arg))
        count = count > 100 ? 100 : count;
        let query = {
            limit: count,
            after: msg_id && last_arg.startsWith('-') ? msg_id : null,
            before: msg_id && !last_arg.startsWith('-') ? msg_id : null
        }

        await message.delete()

        let deleteMore = true
        if (msg_id)
            deleteMore = await message.channel.messages.fetch(msg_id).then(async (msg: Message) => {
                if (!msg) return null
                return await msg.delete().catch(err => null)
            }).catch(err => console.log(err.message))

        if (deleteMore && query.limit)
            await message.channel.messages.fetch(query).then(async (messages: Collection<string, Message>) => {
                const deleted = await message.channel.bulkDelete(messages, true)
                messages.filter((msg: Message) => !deleted.some(del => del.id === msg.id))
                    .forEach(async (msg: Message) => await msg.delete({ timeout: 1000, reason: 'bulk delete'}).catch(err => console.log(err)))
            }).catch(err => console.log(err.message))
    }
};



