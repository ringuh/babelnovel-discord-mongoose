import { Message } from "discord.js";
import { StripMentions } from "../../funcs/mentions";
import { getCommands } from "../../funcs/commandRestrictions";
import { isAdmin, usageMessage } from '../../funcs/commandTools';
import { TextChannel } from 'discord.js';
import { CommandRestrictionType } from '../../models/enums/restriction.enum';
import { CommandRestriction, Novel, config } from "../../models";
import { MessageEmbed } from "discord.js";
import { writeFileSync } from 'fs';
import { printTimeDiff } from "../../funcs/timeDifference";
import { Novels } from "../../models/novel.model";

enum BlacklistTypes {
    reset = "reset",
    server = "server"
}

export default {
    name: ['listnovels'],
    description: 'Lists currently free novels (append --all to list all novels)',
    args: `[genre .. genreN] | [all]`,
    async execute(message: Message, args: string[], params: string[]) {
        args = args.map(arg => arg.toLowerCase())
        const a: Novels = null;
        
        let filter = {};
        if (!params.includes('all')) {
            filter = {
                $or: [
                    { "status.isPay": false },
                    { "status.limitedFree": { $ne: null } }
                ]
            }
        }

        /* if (args.length) {
            filter['genres'] = { $all: ['Fantasy'] }
        } */
        console.log(filter)
        const sortter = params.includes("updated") ? 'timestamp.lastHundredUpdatedAt' : '-releasedChapterCount';
        let novels = await Novel.find(filter).sort(sortter)

        console.log(novels.length)
        const costText = params.includes('all') ? 'ALL' : 'FREE';
        const genreText = args.join(" / ") || '';
        const messageTitle = `${costText} ${genreText}`.trim();

        const embed = new MessageEmbed()
            .setDescription(`${config.numerics.latest_chapter_limit} ${messageTitle} novels with most chapters`)
            .addField('\u200b', '\u200b')
            
        let toFile = [
            "<html><header><style>",
            "body { margin: 0.5em }",
            "li { margin-bottom: 0.5em }",
            "button { margin-left: 0.5em }",
            "red { color: red }",
            "yellow { color: darkorange }",
            "pink {color: pink }",
            "span { font-size: 80% }",
            ".genres { font-size: 60% }",
            "</style>",
            `<title>Babelnovel ${messageTitle} novels (${novels.length})</title>`,
            "</header><body>",
            `<h3>Babelnovel ${messageTitle} novels (${novels.length})<h3>`,
            "<ol>",
        ];

        if (!novels.length)
            embed.addField(`No free novels found`, `Category: ${messageTitle}`)

        let i = 0;
        novels.forEach(novel => {
            const epubCount = novel.epubCount || 0;
            const shouldScrape = novel.releasedChapterCount - epubCount > 200;

            let authLine = [
                novel.name.abbr,
                novel.status.limitedFree ? `<pink>limited free: ${printTimeDiff(novel.status.limitedFree)}</pink>` : null,
                novel.status.isPay ? 'premium' : 'free',
                novel.status.isRemoved ? 'removed' : null,
                novel.translation.completed ? 'completed' : null,
                novel.translation.hiatus ? 'hiatus' : null,
                novel.translation.ignore ? 'not-tracked' : null,

            ].filter(l => l).join(" | ")

            let epubline = epubCount ? `epub: ${epubCount}` : '';
            if (novel.releasedChapterCount - epubCount > 20)
                epubline = `<yellow>${epubline}</yellow>`
            let scrapeMessage = '';
            if (shouldScrape && (!novel.status.isPay || novel.status.limitedFree))
                scrapeMessage = '<red>+++</red>'

            const header = `${novel.name.en} - ${novel.releasedChapterCount}`;
            const url = `https://babelnovel.com/books/${novel.name.canonical}`;
            console.log(novel.name.en, novel.status)
            toFile.push(`<li><a href='${url}'>${header}</a> ${scrapeMessage}` +
                `<div>${epubline}</div>` +
                `<div>${authLine}</div>` +
                `<div class='genres'>${novel.genre.join(" | ")}</div>` +
                `</li>`)
            if (i < config.numerics.latest_chapter_limit) {
                embed.addField(header, url);
                ++i;
            }
        })


        toFile.push("</ol>", "</body>", "</html>")
        const fPath = `static/cache/babelnovel_${costText}_${genreText ? `${genreText}_` : ''}${novels.length}.html`
        writeFileSync(fPath, toFile.join("\r\n"), { encoding: 'utf8' })
        embed.attachFiles([fPath]);

        message.channel.send(embed).then(msg => msg.expire(message));
    }
};





