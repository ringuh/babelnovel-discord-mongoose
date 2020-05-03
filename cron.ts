import { Browser } from "puppeteer";
import { launchBrowser, InitialPage } from "./babel/headlessChrome";
import './extensions/message.extension'
import { fetchFromPageApi } from "./babel/novel/fetchFromPageApi";
import { Novel } from "./models";
import { fetchFromNovelApi } from "./babel/novel/fetchFromNovelApi";
import { LiveMessage } from "./funcs/liveMessage";


try {
    !(async () => {
        let browser: Browser = null;

        if (process.argv.includes('update')) {
            browser = await launchBrowser()
            const chapterLimit = process.argv.includes('all') ? 0 : 450;
            await fetchFromPageApi(browser, chapterLimit)
        }

        else if(process.argv.includes('novels')){
            let liveMessage = new LiveMessage();
            const browser = await launchBrowser()
            let page = await InitialPage(browser, null, liveMessage)
            if (!page) return await liveMessage.fetchingCookieFailed()

            const novels = await Novel.find({ "status.ignored": { $ne: true }})
            for(var i in novels) await fetchFromNovelApi(page, novels[i].babelId, liveMessage);
        }

        else if (process.argv.includes('track')) {
            browser = await launchBrowser()
            /*  const chapterLimit = 
             await fetchNovel(browser, ) */
        }

        else if (process.argv.includes('raw')) {
            browser = await launchBrowser()
        }

        if (browser) browser.disconnect()
        console.log("EXIT CRON", process.argv)
        process.exit();
    })();
} catch (err) {
    console.error(err)
    process.exit();
}
