import { scrapeParameters } from "../../models/interfaces/parameters.interface";
import { Novels } from "../../models/novel.model";
import { Message } from "discord.js";
import { launchBrowser, InitialPage } from "../headlessChrome";
import { LiveMessage } from "../../funcs/liveMessage";
import { Page } from "puppeteer";
import { CodeList } from "../../models/enums/codeList.enum";
import { ReturnObject } from "../../models/interfaces/returnObject.interface";
import { GroupChapterDTO, ChapterDTO } from "../../models/dtos/chapter.dto";
import { config } from "../../models";
import { red, green, magenta } from "../../funcs/commandTools";
import { waitFor } from "../../funcs/waitFor";
import { ChapterGroupJsonDTO } from "../../models/dtos/json.dto";
import { chapterGroupDTO } from "../../models/dtos/chapterGroup.dto";
import { Chapters, Chapter } from "../../models/chapter.model";
import { updateFromChapterApi } from "./updateFromChapterApi";

export async function scrapeNovels(novels: Novels[], parameters: scrapeParameters, message?: Message) {
    let liveMessage = new LiveMessage(message);
    const browser = await launchBrowser()
    let page = await InitialPage(browser, null, liveMessage)
    if (!page) return await liveMessage.fetchingCookieFailed()

    for (var i in novels)
        await scrapeChapters(page, novels[i], parameters, liveMessage)
    await liveMessage.scrapeCompleted()
}


async function scrapeChapters(page: Page, novel: Novels, parameters: scrapeParameters, liveMessage?: LiveMessage): Promise<ReturnObject> {
    console.log(parameters)
    if(novel.status.isPay && (!novel.status.limitedFree && !parameters.token)) {
        return await liveMessage.novelIsPremium()
    }
    
    let chapters: GroupChapterDTO[] = [];
    for (let attemptNr = 0, limitNr = 5; attemptNr < limitNr; ++attemptNr) {
        let fetch_url = config.api.chapter_groups.replace("<book>", novel.babelId);
        await liveMessage.fetchChapterGroups(novel, attemptNr, limitNr)

        try {
            await page.goto(fetch_url);
            const json = await page.evaluate(() => {
                return JSON.parse(document.querySelector("body").innerText);
            });
            if (json.code !== 0) throw { message: `Chapter group code is wrong ${json.code}` }

            chapters = json.data.map((chapterGroup: chapterGroupDTO) => {
                return chapterGroup.firstChapter.id !== chapterGroup.lastChapter.id ?
                    [chapterGroup.firstChapter, chapterGroup.lastChapter] : chapterGroup.firstChapter
            }).flat()

            await liveMessage.foundNrChapters(chapters.length)
            break
        }
        catch (e) {
            console.log(red(`JSON parse error: ${e.message}`))
            attemptNr++;
            await waitFor();
            continue;
        }
    }


    console.log(green(novel.name.canonical))
    if (parameters?.reverse) chapters = chapters.reverse()

    let existingChapters = await getExistingChapters(novel.babelId);
    let scrapeOrder = parameters?.hop ? getHopChapters(chapters, existingChapters) : [...chapters]

    let weight = 0

    for (let attemptNr = 0; attemptNr < 5; ++attemptNr) {
        try {
            for (var i in scrapeOrder) {
                let json: {
                    code: number,
                    data: ChapterDTO
                };
                const chapterDTO: GroupChapterDTO = scrapeOrder[i];
                const exChapter = existingChapters.find(ex => chapterDTO.id === ex.babelId)
                
                if (exChapter?.content?.babel && !parameters?.recheck) continue
                if (exChapter?.status?.ignore) continue
                if (exChapter?.status?.skip && ((Math.ceil(Math.random() * 100) + weight < 90))) continue
                console.log("fetching", chapterDTO.canonicalName)
                try {
                    const fetch_url = config.api.chapter.replace("<book>", novel.babelId).replace("<chapterName>", chapterDTO.id);
                    await page.goto(fetch_url)
                    json = await page.evaluate(() => {
                        return JSON.parse(document.querySelector("body").innerText);
                    });

                    if (json.code !== 0) {
                        const chapterArg: Chapters = {
                            babelId: chapterDTO.id,
                            novelId: novel.babelId,
                            content: {
                                raw: null,
                                babel: null,
                                initial: null,
                                proofread: null,
                            },
                            status: {
                                skip: false,
                                ignore: false,
                                attempts: 0
                            },
                            timestamp: {
                                createdAt: new Date().toISOString()
                            }
                        }
                        const chapter = await Chapter.findOne({ babelId: chapterDTO.id }) || await Chapter.create(chapterArg)
                        await chapter.updateOne({"status.attempts": chapter.status.attempts + 1, "status.skip": true })
                        
                        console.log(magenta(`Chapter code wrong for ${chapterDTO.name} ${chapterDTO.num}`))
                        continue
                    }
                    
                    const chapterData: ChapterDTO = json.data;

                    const retObj: ReturnObject = await updateFromChapterApi(novel, chapterData, parameters, liveMessage)
                    if (retObj.code === CodeList.chapter_premium && !parameters.ignoreAll) {
                        return retObj
                    }
                    else if (retObj.code == CodeList.chapter_already_parsed) {
                        existingChapters = await getExistingChapters(novel.babelId)
                        if (parameters.hop) throw { code: CodeList.hop_again }
                    }
                } catch (err) {
                    if (err?.code === CodeList.hop_again) {
                        throw err
                    }
                    console.log(red(`Error fetching chapter ${chapters[i].num}: ${err.message}`))
                    await waitFor();
                    continue
                }
            }
            return { code: CodeList.success, message: "Chapters scraped" }
        } catch (err) {
            if (err?.code === CodeList.hop_again) {
                scrapeOrder = getHopChapters(chapters, existingChapters)
                --attemptNr;
                continue;
            }
            console.log(red(err.message))
        }
    }

    return { code: CodeList.success, message: "Fetched novels" }
}



async function getExistingChapters(novelId: string): Promise<Chapters[]> {
    console.log(novelId)
    const chapters = await Chapter.find({
        novelId: novelId
    });
    
    return chapters.filter(chapter => chapter.content.babel || chapter.status.ignore);
}

async function getHopChapters(chapters: GroupChapterDTO[], existingChapters: Chapters[]): Promise<Chapters[]> {
    let emptySlots: number[] = chapters.map(c => {
        const ex = existingChapters.find(ex => c.id === ex.babelId)
        return ex?.content?.babel ? 1 : 0
    })

    let [topValue, topIndex] = [0, 0]

    emptySlots.reduce((previousValue, currentValue, index, array) => {
        if (!currentValue) return 0
        let cv = currentValue + previousValue;
        if (currentValue) emptySlots[index] = cv;
        if (cv > topValue) {
            topValue = cv;
            topIndex = index;
        }
        return cv
    })

    const coinFlip = (Math.floor(Math.random() * 2) == 0);
    let slicedChapters = []
    if (coinFlip) slicedChapters = chapters.slice(topIndex - Math.floor(topValue / 2), topIndex + 1)
    else slicedChapters = chapters.slice(topIndex - (topValue - 1), topIndex + 1 - Math.floor(topValue / 2)).reverse()

    return slicedChapters
}