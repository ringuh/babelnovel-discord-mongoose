import { scrapeParameters } from "../../models/interfaces/parameters.interface";
import { Novels } from "../../models/novel.model";
import { Message } from "discord.js";
import { launchBrowser, InitialPage } from "../headlessChrome";
import { LiveMessage } from "../../funcs/liveMessage";
import { Page } from "puppeteer";
import { CodeList } from "../../models/enums/codeList.enum";
import { ReturnObject } from "../../models/interfaces/returnObject.interface";

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
    
    return { code: CodeList.success, message: "Fetched novels" }
}