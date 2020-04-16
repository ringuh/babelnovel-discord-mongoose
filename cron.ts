import { Browser } from "puppeteer";
import { launchBrowser } from "./babel/headlessChrome";
import { fetchNovels } from "./babel/fetchNovels";
import './extensions/message.extension'

!(async () => {
    let browser:Browser = null;

    if (process.argv.includes('novels')) {
        browser = await launchBrowser()
        const chapterLimit = process.argv.includes('all') ? 0 : 1000;
        await fetchNovels(browser, chapterLimit)
    }

    if (process.argv.includes('track')) {
        browser = await launchBrowser()
       /*  const chapterLimit = 
        await fetchNovel(browser, ) */
    }

    if(process.argv.includes('update')) {
        browser = await launchBrowser()
    }   

    else if (process.argv.includes('raw')) {
        browser = await launchBrowser()
    }

    if (browser) browser.disconnect()
})();