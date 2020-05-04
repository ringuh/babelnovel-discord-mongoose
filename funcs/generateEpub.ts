import { Novels, Novel } from "../models/novel.model";
import { Chapters } from "../models/chapter.model";

import { existsSync, mkdirSync, statSync, unlinkSync } from 'fs';
import { resolve } from "dns";
import { red } from "./commandTools";
const Epub = require("epub-gen-funstory");

export enum EpubType {
    initial = 'initial',
    babel = 'babel',
    proofread = 'proofread'
}

export interface EpubParams {
    type: EpubType
}

interface EpubOption {
    title: string,
    author: string,
    output: string,
    appendChapterTitles?: boolean,
    cover: string,
    content: EpubChapter[];
    css?: string,
    lang?: string,
}

interface EpubChapter {
    title: string,
    nr: number,
    data: string,
    author?: string,
    excludeFromToc?: boolean,
    beforeToc?: boolean,
    filename?: string,
}

export function EpubGenerator(novel: Novels, chapters: Chapters[], params: EpubParams): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
        const epubContent = handleChapters(chapters, params);

        const values = await splitEpub(novel, epubContent)

        const epubs = values.filter(v => v).flat().sort((a, b) => {
            const endingA = a.replace(".epub", "").split("-");
            const endingB = b.replace(".epub", "").split("-");

            return parseInt(endingA.last()) - parseInt(endingB.last())
        })
        console.log(epubs)

        resolve(epubs)
    });
}





function handleChapters(chapters: Chapters[], params: EpubParams): EpubChapter[] {
    return chapters.map(chapter => {
        const titleWords = 6;
        let content: string = chapter.content[params.type] || chapter.content.babel || chapter.content.initial;
        content = content.replace(/\<p\>/gi, "").replace("/\<\/\>/gi", "\n");
        const words = content.split(/\s+/gi);
        const footer = `<div style="font-size: 70%;">${content.length} characters | ${words} words</div>`

        const title = chapter?.name.length > 5 ? chapter.name : `${chapter.name} - ${words.slice(0, words.length < titleWords ? words.length : titleWords)}`;

        const epubChapter: EpubChapter = {
            title: title,
            nr: chapter.num / 10000,
            data: `${content}<hr/>${footer}`
        };

        return epubChapter;
    })
}

function splitEpub(novel: Novels, chapters: EpubChapter[]): Promise<string[]> {
    return new Promise(async resolve => {
        if (!chapters.length) return resolve(null);
        console.log(chapters.length, chapters.last().nr)
        const split = novel.epubSplit || 10;
        const content = chapters.slice(0, split);
        const filename = `${novel.name.canonical}_${content.length}_${content[0].nr}-${content.last().nr}.epub`;
        const title = `${novel.name.en} ${content[0].nr} - ${content.last().nr}`;

        let epubFolder = './static/epub';
        if (!existsSync(epubFolder)) mkdirSync(epubFolder);
        const epubPath = `${epubFolder}/${filename}`;
        if (existsSync(epubPath)) {
            chapters.splice(0, split);
            const nextFiles = await splitEpub(novel, chapters) || [];
            return resolve([...nextFiles, epubPath])
        }

        const option: EpubOption = {
            title: title,
            author: [novel.author.enName, novel.author.name].filter(n => n).join(" | "),
            output: epubPath,
            cover: novel.cover,
            content: content
        }

        new Epub(option).promise.then(async () => {
            const stats = statSync(epubPath);
            const fileSizeInMegabytes = stats["size"] / 1000000.0

            const megaLimit = 1;
            if (fileSizeInMegabytes < megaLimit) {
                chapters.splice(0, split);
                const nextFiles = await splitEpub(novel, chapters) || [];
                return resolve([...nextFiles, epubPath])
            }


            unlinkSync(epubPath)

            const splitTo = Math.ceil(fileSizeInMegabytes / megaLimit)
            let chapterCount = 1500

            if (chapters.length >= 1200)
                chapterCount = 1000
            else if (chapters.length >= 1000)
                chapterCount = 800
            else if (chapters.length >= 800)
                chapterCount = 500
            else if (chapters.length >= 500)
                chapterCount = Math.floor(chapters.length / splitTo)

            await Novel.findOneAndUpdate({ babelId: novel.babelId }, { epubSplit: chapterCount });
            novel.epubSplit = chapterCount;

            return resolve(splitEpub(novel, content))
        }).catch(err => {
            console.log(red(err.message));
            resolve(null)
        })
    })

}