import { Browser } from "puppeteer";
import { launchBrowser } from "./babel/headlessChrome";
import './extensions/message.extension'
import { fetchFromPageApi } from "./babel/novel/fetchFromPageApi";


try {
    !(async () => {
        let browser: Browser = null;

        if (process.argv.includes('novels')) {
            browser = await launchBrowser()
            const chapterLimit = process.argv.includes('all') ? 0 : 450;
            await fetchFromPageApi(browser, chapterLimit)
        }

        if (process.argv.includes('track')) {
            browser = await launchBrowser()
            /*  const chapterLimit = 
             await fetchNovel(browser, ) */
        }

        if (process.argv.includes('update')) {
            browser = await launchBrowser()
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
