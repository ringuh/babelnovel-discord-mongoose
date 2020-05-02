import { Message } from "discord.js";
import { usageMessage } from "../../funcs/commandTools";
import { MessageEmbed } from "discord.js";
import { config } from "../../models";
import { findNovel } from "../../babel/novel/findNovel";
import { printTimeDiff } from "../../funcs/timeDifference";

export default {
    name: ['babel', 'b'],
    description: 'Print novel info',
    args: "<novel>",
    async execute(message: Message, args: string[], params: string[]) {
        if (args.length < 1) return usageMessage(message, this)
        const novel = await findNovel(message, args);
        if (!novel) return false

        let authLine = [
            novel.name.abbr,
            novel.status?.isPay ? 'premium' : null,
            novel.status?.isRemoved ? 'removed' : null,
            novel.translation?.hiatus ? 'hiatus' : null,
            novel.translation?.ignore ? 'not-tracked' : null,
            novel.translation?.completed ? 'completed' : null,
            novel.status.limitedFree ? `limited free: ${printTimeDiff(novel.status.limitedFree)}` : null,
        ].filter(l => l).join(" | ")

        const emb = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(novel.name.en)
            .setAuthor(authLine, null, null)
            .setURL(config.api.novel.replace("/api/", "/").replace("<book>", novel.name.canonical))

            .setDescription(novel.synopsis ? novel.synopsis.substr(0, 1000) : 'description missing')
            .setTimestamp()
            .addField("bookId", novel.babelId, true)
            .addField("Rating", Math.round(novel.ratingNum * 100) / 100, true)
            .addField('\u200b', '\u200b')
            .addField("Chapters", novel.releasedChapterCount, true)
            .addField("Epub", novel.epubCount, true)
            .addField('\u200b', '\u200b')
        if (novel.name.raw) emb.addField("Name", novel.name.raw, true)
        if (novel.author?.name || novel.author?.enName)
            emb.addField("Author", [novel.author.name, novel.author.enName].filter(a => a).join(" | "), true)
        emb.addField('\u200b', '\u200b')
        if (novel.status.isRemoved && !novel.status.isDeleted)
            emb.addField("Library script command", `!script ${novel.name.canonical}`)

        if (novel.sourceUrl)
            emb.addField('\u200b', '\u200b').addField("Source", novel.sourceUrl)

        if (novel.cover?.startsWith("static")) {
            const coverName = `attachment://${novel.cover.split("/").pop()}`
            emb.attachFiles([`${novel.cover}`])
            emb.setThumbnail(coverName)
            emb.setFooter(novel.genre.join(" | "), coverName)
        }

        await message.channel.send(emb).then((msg: Message) => msg.bin(message));
    }
};