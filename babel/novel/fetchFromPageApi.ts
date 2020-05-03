import { PageApiDTO } from "../../models/dtos/pageApi.dto"
import { Browser, Page } from "puppeteer"
import { ReturnObject } from "../../models/interfaces/returnObject.interface"
import { LiveMessage } from "../../funcs/liveMessage"
import { InitialPage } from "../headlessChrome"
import { Interceptions } from "../../models/enums/interceptions.enum"
import { waitFor } from "../../funcs/waitFor"
import { CodeList } from "../../models/enums/codeList.enum"
import { config } from "../../models"
import { updateFromPageApi } from "./updateFromPageApi"
import { fetchFromNovelApi } from "./fetchFromNovelApi"

const { red, gray, magenta, yellow, green } = require('chalk').bold

interface jsonDTO {
    code: number,
    data: PageApiDTO[]
}

async function fetchFromPageApi(browser: Browser, chapterLimit: number): Promise<ReturnObject> {
    const liveMessage = new LiveMessage()
    const page: Page = await InitialPage(browser, chapterLimit ? Interceptions.novels_latest : Interceptions.novels_all, liveMessage)
    if (!page) return await liveMessage.fetchingCookieFailed()

    let pageNr: number = 0
    let attemptNr: number = 0;
    const maxAttempts = 5;
    let json: jsonDTO = { code: 0, data: [null] };
    while (json.code === 0 && json.data.length && attemptNr < maxAttempts) {
        let fetch_url = config.api.novels.replace("<pageNr>", pageNr.toString()).replace("<pageSize>", "20");
        if (chapterLimit) fetch_url = `${fetch_url}&enSerial=ongoing`;
        console.log(green("page", pageNr), gray(`- attempt ${attemptNr + 1}/${maxAttempts}`));
        try {
            await page.goto(fetch_url);
            json = await page.evaluate(() => {
                return JSON.parse(document.querySelector("body").innerText);
            });

            if (json.code) continue
        }
        catch (e) {
            console.log(red(`JSON parse error: ${e.message}`))
            attemptNr++;
            await waitFor();
            continue;
        }

        for (var i in json.data) {
            const novelData: PageApiDTO = json.data[i];
            if (novelData.releasedChapterCount < chapterLimit) {
                console.log("below limit")
                json.code = -1
                break;
            }
            console.log(novelData.canonicalName, novelData.releasedChapterCount)

            const res = await updateFromPageApi(novelData, liveMessage);
            if (res.code === CodeList.novel_created) {
                await fetchFromNovelApi(page, novelData.id, liveMessage);
            }
            break
        }
break
        pageNr++;
    }
    return { code: CodeList.success, message: "Fetched novels" }
}


export { fetchFromPageApi }


