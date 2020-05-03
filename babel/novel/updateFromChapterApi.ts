import { ChapterDTO } from "../../models/dtos/chapter.dto"
import { scrapeParameters } from "../../models/interfaces/parameters.interface"
import { ReturnObject } from "../../models/interfaces/returnObject.interface"
import { gray, magenta, green, red, yellow } from "../../funcs/commandTools"
import { CodeList } from "../../models/enums/codeList.enum"
import { Chapter } from "../../models"
import { Novels, Novel } from "../../models/novel.model"
import { Chapters } from "../../models/chapter.model"
import { LiveMessage } from "../../funcs/liveMessage"
import datetimeDifference from "datetime-difference"
import { ReturnModelType } from "@typegoose/typegoose"
import { Model } from "mongoose"

export async function updateFromChapterApi(novel: Novels, json: ChapterDTO, params: scrapeParameters, liveMessage: LiveMessage): Promise<ReturnObject> {
    const timestamp = new Date().toISOString();

    const isPay = !(json.isFree || json.isLimitFree || json.isBought || json.isBorrowed);
    if (isPay) {
        await Novel.findOneAndUpdate({ babelId: novel.babelId }, { "status.isPay": true })
        return await liveMessage.chapterIsPremium();
    }

    const chapterArg: Chapters = {
        babelId: json.id,
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
            createdAt: timestamp
        }
    }
    
    const chapter = await Chapter.findOne({ babelId: json.id }) || await Chapter.create(chapterArg);

    if (chapter.content?.babel && !params.recheck) {
        const msg = `Chapter ${chapter.canonicalName} has already been parsed`
        console.log(gray(msg))
        return { code: CodeList.chapter_already_parsed, message: msg }
    }

    if (json.content?.length < 200) {
        json.content = null;
    }

    if (!json.content) {
        chapter.status = {
            ...chapter.status,
            skip: true,
            attempts: chapter.status.attempts + 1
        }

    }

    chapter.prevId = json.prevId;
    chapter.nextId = json.nextId;
    chapter.num = json.num;
    chapter.index = json.index;
    chapter.name = json.name;
    chapter.canonicalName = json.canonicalName;
    chapter.zhSourceURL = json.zhSourceURL;
    chapter.zhTitle = json.zhTitle;
    chapter.timestamp = {
        ...chapter.timestamp,
        babelCreatedAt: json.createTime,
        babelUpdatedAt: json.updateTime,
        checkedAt: timestamp
    }


    if (json.content) {
        chapter.content = {
            ...chapter.content,
            initial: chapter.content.initial || json.content,
            babel: json.content
        }

        chapter.timestamp = {
            ...chapter.timestamp,
            successAt: timestamp
        }
        if (chapter.content.initial !== chapter.content.babel)
            console.log(magenta(`Chapter content is different than initial ${chapter.content.initial.length} vs ${chapter.content.babel.length}`))

    }

    return await chapter.save().then(success => liveMessage.chapterUpdated(chapter))
        .catch(err => liveMessage.chapterUpdateFailed(err, chapter))
}
