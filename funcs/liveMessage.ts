import { Message } from "discord.js";
import { CodeList } from "../models/enums/codeList.enum";
import { ReturnObject } from "../models/interfaces/returnObject.interface";
import { NovelClass } from "../models/novel.model";
const { white, gray, cyan, yellow, magenta, red, green, blue } = require('chalk').bold;

export class LiveMessage {
    private _sent: Message;

    constructor(private _message?: Message) {

    }

    novelCreated(novel: NovelClass) {
        const text = `Added novel ${novel.name.canonical}`;
        console.log(green(text));
        return { code: CodeList.novel_created, message: text }
    }

    novelCreationFailed(error: any, novel: NovelClass) {
        const text = `Failed to add novel ${novel.name.canonical}\n${error.message}`
        console.log(red(text));
        return { code: CodeList.novel_creation_failed, message: text }
    }

    novelFetchCodeWrong(json: any): ReturnObject {
        const text = `Novel fetch code ${json.code} is wrong`;
        console.log(red(text))
        return { code: CodeList.novel_fetch_code_wrong, message: text }
    }

    novelFetchError(error: any, json: any): void {
        const text = `JSON parse error: ${error.message}`;
        console.log(red(text))
    }

    novelFetchFailed(attempts: number) {
        const text = `Fetching novel failed after ${attempts} attempts`
        console.log(magenta(text))
        return { code: CodeList.novel_fetch_error, message: text }
    }

    novelUpdated(novel: NovelClass) {
        const text = `Updated Novel ${novel.name.canonical}`
        console.log(yellow(text))
        return { code: CodeList.novel_updated, message: text }
    }

    novelChecked() {
        const text = "Novel checked, nothing to update"
        return { code: CodeList.novel_checked, message: text }
    }

    novelUpdateFailed(error: any, novel: NovelClass) {
        const text = `Failed to fetch update novel ${novel.name.canonical}\n${error.message}`;
        console.log(magenta(text))
        return { code: CodeList.novel_update_failed, message: text }
    }

    jsonParseError(error: any) {
        console.log(red(`JSON parse error: ${error.message}`))
    }

    async fetchingCookie(attemptNr: number, limitNr: number) {
        const text = `Fetching cookie attempt ${attemptNr + 1} / ${limitNr}`
        console.log(cyan(text))
        if (this._sent) this._sent.edit(text, { code: true });
        else if (this._message)
            this._message.channel.send(text, { code: true }).then((msg: Message) => this._sent = msg)

    }

    async fetchingCookieFailed(): Promise<ReturnObject> {
        const text = "Loading cookie failed";
        console.log(red(text))
        if (this._sent) this._sent.edit(text, { code: true }).then((msg: Message) => msg.bin(this._message, true))
        return { code: CodeList.babel_cookie_missing, message: text }
    }

    async fetchChapterGroups(novel: NovelClass, attemptNr: number, limitNr: number) {
        console.log(green(`Fetching chapters for ${novel.name.canonical} ${attemptNr} / ${limitNr}`))

    }

    async fetchChapterGroupsWrongCode(novel: NovelClass, code: number) {

    }

    async foundNrChapters(count: number) {
        console.log(gray(`Found ${count} chapters`))
    }



    async scrapeCompleted(): Promise<ReturnObject> {
        const msg = `Scrape finished`;
        console.log(blue(msg))
        if (this._sent) this._sent.expire(this._message, null, 1)
        if (this._message) this._message.reply(msg, { code: true }).then((msg: Message) => msg.bin(this._message, true))
        return { code: CodeList.success, message: msg }
    }
}