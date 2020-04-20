import { connect, launch, Browser, Page } from 'puppeteer';
import { config, Setting } from '../models';
import { Collections } from '../models/enums/collections.enum';
import { Interceptions } from '../models/enums/interceptions.enum';
import { LiveMessage } from '../funcs/liveMessage';
import { waitFor } from '../funcs/waitFor';
import { fstat, readSync, readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
const { red, green, yellow, magenta } = require('chalk').bold;
let browser: Browser = null;
const puppeteerFile = join(__dirname, "../static/cache/puppeteer.json");

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

    if (!setting) setting = new Setting({ server: config.identifier, key: headless });
    setting.value = browser.wsEndpoint();
    await setting.save();

    return browser
}


export const InitialPage = async (browser: Browser, interception: Interceptions, liveMessage: LiveMessage) => {
    const limitNr = 3;
    for (let attemptNr = 0; attemptNr < limitNr; ++attemptNr) {
        let page: Page;
        try {
            liveMessage.fetchingCookie(attemptNr, limitNr)
            page = await browser.newPage();
            await page.goto("https://babelnovel.com/search");
            // lets find that history-text
            const h2s = await page.evaluate(() =>
                Array.from(
                    document.querySelectorAll('h2'),
                    element => element.textContent.trim().toLowerCase())
            );

            if (!h2s.includes("history")) throw {}
            await setInterception(page, interception)
            return page
        } catch (e) {
            await waitFor()
            await page.close()
            page = null
            continue
        }
    }
    return null
}


interface PuppeteerBusyInterface {
    timestamp: number;
    interception: Interceptions;
}

async function setInterception(page: Page, interception: Interceptions): Promise<void> {
    await page.setRequestInterception(true);
    page.on('request', async request => {
        if (!request.isNavigationRequest()) {
            if (config.bad_requests &&
                config.bad_requests.some((str: string) => request.url().includes(str)))
                return request.abort()
            return request.continue();
        }

        const data: PuppeteerBusyInterface = getPuppeteerFile();

        let delay = config.numerics.puppeteer_request_delay;
        const url = request.url()
        if (!url.includes("/api/")) delay = 500

        const timestamp = Date.now() - data.timestamp;

        if (interception > data.interception && timestamp < config.numerics.puppeteer_busy_duration) {
            console.log(magenta("Puppeter was busy"))
            return request.abort('aborted');
        }

        console.log(url, magenta(delay))
        await page.waitFor(delay)
        writePuppeteerFile(interception, Date.now())
        return request.continue();
    });

    page.on('requestfinished', async request => {
        if (request.isNavigationRequest()) {
            console.log("finished")
            writePuppeteerFile(Interceptions.finished, Date.now())
        }
    });
}

export function writePuppeteerFile(interception: Interceptions, timestamp = 0) {
    writeFileSync(puppeteerFile, JSON.stringify({ interception: interception, timestamp: timestamp }));
}

export function getPuppeteerFile() {
    if (!existsSync(puppeteerFile)) writeFileSync(puppeteerFile, JSON.stringify({ interception: Interceptions.finished, timestamp: 0 }));
    return JSON.parse(readFileSync(puppeteerFile, { encoding: 'utf8' }));
}