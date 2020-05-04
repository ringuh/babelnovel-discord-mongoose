import { Message } from "discord.js";
import { usageMessage, blue } from "../../funcs/commandTools";
import { MessageEmbed } from "discord.js";
import { config, Chapter } from "../../models";
import { findNovel } from "../../babel/novel/findNovel";
import { printTimeDiff } from "../../funcs/timeDifference";
import { isNumber } from "util";
import { EpubGenerator, EpubParams, EpubType } from "../../funcs/generateEpub";

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

        let chapters = await Chapter.find({ novelId: novel.babelId }).sort("num");
        chapters = chapters.filter(c => c.content.babel || c.content.proofread)

        const files = await EpubGenerator(novel, chapters, HandleParams(params))
        console.log(blue(files))
        //await message.channel.send(emb).then((msg: Message) => msg.bin(message));
    }
};


function HandleParams(params: string[]): EpubParams {
    const pms = {
        type: EpubType.proofread
    }

    if (params.includes('babel')) pms.type = EpubType.babel;
    else if(params.includes('initial')) pms.type = EpubType.initial;

    return pms;
}