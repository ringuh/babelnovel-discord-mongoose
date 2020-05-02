import { Novels, Novel } from "../../models/novel.model"
import { PageApiDTO } from "../../models/dtos/pageApi.dto"
import { LiveMessage } from "../../funcs/liveMessage"
import { ReturnObject } from "../../models/interfaces/returnObject.interface"

export async function updateFromPageApi(json: PageApiDTO, liveMessage: LiveMessage): Promise<ReturnObject> {
    const timestamp = new Date().toISOString()
    let novelCreated = false;
    let novel = await Novel.findOne({ babelId: json.id });
    if (!novel) {
        const novelArgs: Novels = {
            babelId: json.id,
            name: {
                en: json.name,
                abbr: null,
                raw: json.cnName,
                canonical: json.canonicalName,
                historyCanonical: json.historyCanonicalName,
                search: json.name.toLowerCase(),
                aliases: json.alias?.split("|").filter(t => t && t.trim().length) || []
            },
            author: { name: null, enName: null },
            timestamp: {
                createdAt: timestamp
            },
            translation: {
                hiatus: false,
                completed: false,
                ignore: false
            },
            status: { isRemoved: false }
        }
        novel = await Novel.create(novelArgs);
        novelCreated = true;
    }

    const originalJson = novel.toJSON()
    console.log(originalJson)
    novel.name = {
        ...novel.name,
        en: json.name,
        raw: json.cnName,
        canonical: json.canonicalName,
        historyCanonical: json.historyCanonicalName,
        search: json.name.toLowerCase(),
        aliases: json.alias?.split("|").filter(t => t && t.trim().length) || []
    };
    novel.timestamp = {
        ...novel.timestamp,
        babelCreatedAt: json.createTime,
        babelUpdatedAt: json.updateTime
    };
    novel.status.isRemoved = false;
    novel.cover = novel.cover || json.cover;
    if (json.synopsis !== novel.synopsis)
        novel.synopsis = json.synopsis;
    novel.genre = json.genres?.map(genre => genre.name) || novel.genre || [];
    novel.tag = json.tag?.split("|").filter(t => t && t.trim().length) || novel.tag || [];
    novel.releasedChapterCount = json.releasedChapterCount;


    let differencesCount = 0;

    Object.keys(originalJson).filter(key => !key.startsWith('_')).map(key => {
        if (JSON.stringify(originalJson[key]) !== JSON.stringify(novel[key])) differencesCount++;
    });
    console.log(differencesCount);

    if (differencesCount) novel.timestamp.updatedAt = timestamp;
    novel.timestamp.pageApiCheckedAt = timestamp;

    await novel.save().then(success => {
        if (!differencesCount) return liveMessage.novelChecked();
        if (novelCreated) return liveMessage.novelCreated(novel)
        return liveMessage.novelUpdated(novel)
    }).catch(err => liveMessage.novelUpdateFailed(err, novel))

    return liveMessage.novelChecked()
}