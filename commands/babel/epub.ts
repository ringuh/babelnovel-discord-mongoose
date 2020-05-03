import { Message } from "discord.js";
import { usageMessage } from "../../funcs/commandTools";
import { MessageEmbed } from "discord.js";
import { config } from "../../models";
import { findNovel } from "../../babel/novel/findNovel";
import { printTimeDiff } from "../../funcs/timeDifference";
import { isNumber } from "util";

export default {
    name: ['epub'],
    description: 'Generates epub',
    args: "<novel> [from / from-to]",
    async execute(message: Message, args: string[], params: string[]) {
        if (args.length < 1) return usageMessage(message, this)

        let [from, to] = [0, 20000]

        if (args.length > 1) {
            const [f, t] = args.last().split("-", 2).map(value => parseInt(value) || null)

            from = f || from;
            if (f) to = t || to;
            if (f) args.pop();
        }

        const novel = await findNovel(message, args);
        if (!novel) return false


        console.log(novel.name.canonical, from, to)

        //await message.channel.send(emb).then((msg: Message) => msg.bin(message));
    }
};