import { Message } from "discord.js";
import { isBypass, usageMessage } from "../../funcs/commandTools";
import { findNovel } from "../../babel/novel/findNovel";
import { scrapeParameters } from "../../models/interfaces/parameters.interface";
import { scrapeNovels } from "../../babel/novel/scrapeNovel";


export default {
    name: ['scrape'],
    description: 'Prints the script to add the novel to babel library',
    args: "<novel>",
    hidden: true,
    async execute(message: Message, args: string[], params: string[]) {
        if (!isBypass(message)) return false
        if (args.length < 1) return usageMessage(message, this)
        const novel = await findNovel(message, args);
        if (!novel) return false

        await scrapeNovels([novel], handleParams(params), message)
    }
};


function handleParams(params: string[]): scrapeParameters {
    let returnParameters: scrapeParameters = {
        hop: params.includes("hop"),
        reverse: params.includes("reverse") || params.includes("rev"),
        ignoreAll: params.includes("ignore"),
        recheck: params.includes("recheck"),
        token: params.find(p => p.startsWith("token="))?.substr(6)
    }

    return returnParameters
}