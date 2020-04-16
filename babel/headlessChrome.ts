import { connect, launch, Browser } from 'puppeteer';
import { config, Setting } from '../models';
import { Collections } from '../models/enums/collections.enum';
const { red, green, yellow } = require('chalk').bold;
let browser: Browser = null;

export async function launchBrowser(allow?: boolean): Promise<Browser> {
    if (browser?.isConnected()) return browser;

    const headless = `chrome_${config.identifier}`;
    let setting = await Setting.findOne({ server: config.identifier, key: headless })

    if (setting?.value) {
        browser = await connect({
            browserWSEndpoint: setting.value.toString()
        }).then(success => {
            console.log(green("Puppeteer opened on existing Chrome"));
            return success;
        }).catch(err => {
            console.log(red(`Opening old browser failed: ${err.message}`))
            return null
        })
        if (browser) return browser;
    }

    if (!allow) throw {
        code: 99, message: "Not allowed to open new browser"
    }
    browser = await launch({
        args: ['--mute-audio', '--disable-setuid-sandbox']
    }).finally(() => console.log(yellow("Started a new browser")))

    if(!setting) setting = new Setting({ server: config.identifier, key: headless});
    setting.value = browser.wsEndpoint();
    await setting.save();

    return browser
}