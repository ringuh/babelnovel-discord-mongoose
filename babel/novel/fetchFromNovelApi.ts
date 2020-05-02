import { Page } from "puppeteer";
import { LiveMessage } from "../../funcs/liveMessage";
import { ReturnObject } from "../../models/interfaces/returnObject.interface";
import { NovelDTO } from "../../models/dtos/novel.dto";
import { waitFor } from "../../funcs/waitFor";
import { config } from "../../models";
import { updateFromNovelApi } from "./updateFromNovelApi";

async function fetchFromNovelApi(page: Page, babelId: string, liveMessage?: LiveMessage): Promise<ReturnObject> {
    let json: {
        code: number,
        data: NovelDTO
    };
    const attemptLimit = 5;

    for (let attemptNr = 0; attemptNr < attemptLimit; ++attemptNr) {
        let fetch_url = config.api.novel.replace('<book>', babelId)
        try {
            await page.goto(fetch_url);
            json = await page.evaluate(() => {
                return JSON.parse(document.querySelector("body").innerText);
            });
            if (json.code !== 0) {
                await page.screenshot({ path: `./static/screenshot/novel_fetch_error_${babelId}.png` });
                return liveMessage.novelFetchCodeWrong(json)
            }
            return await updateFromNovelApi(json.data, liveMessage)
        }
        catch (e) {
            liveMessage.novelFetchError(e, json)
            if (!page) break
            await page.screenshot({ path: `./static/screenshot/err_novel_${babelId}.png` });
            await waitFor();
            continue;
        }
    }

    return liveMessage.novelFetchFailed(attemptLimit)
}

export { fetchFromNovelApi }