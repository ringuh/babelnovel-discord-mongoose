import { NovelDTO } from "../../models/dtos/novel.dto";
import { LiveMessage } from "../../funcs/liveMessage";
import { ReturnObject } from "../../models/interfaces/returnObject.interface";
import { promotionType } from "../../models/dtos/promotion.dto";
import { Novel } from "../../models";
import { downloadCover } from "./downloadNovelCover";

async function updateFromNovelApi(json: NovelDTO, liveMessage: LiveMessage): Promise<ReturnObject> {
    const timestamp = new Date().toISOString();
    const novel = await Novel.findOne({ babelId: json.id });
    const originalJson = novel.toJSON();

    novel.name = {
        ...novel.name,
        en: json.name,
        raw: json.cnName,
        canonical: json.canonicalName,
        historyCanonical: json.historyCanonicalName,
        search: json.name.toLowerCase(),
        aliases: json.alias?.split("|").filter(t => t && t.trim().length) || novel.name?.aliases || []
    };

    novel.author = {
        ...novel.author,
        name: json.author?.name || novel.author?.name || null,
        enName: json.author?.enName || novel.author?.enName || null
    };

    novel.timestamp = {
        ...novel.timestamp,
        babelCreatedAt: json.createTime,
        babelUpdatedAt: json.updateTime,
        novelApiCheckedAt: timestamp,
    }

    novel.status = {
        ...novel.status,
        isRemoved: json.isShowStrategy,
        isPay: json.isPay,
        limitedFree: null,
        limitedDiscount: null
    };

    if (json.synopsis?.length && json.synopsis !== novel.synopsis)
        novel.synopsis = json.synopsis;

    novel.cover = novel.cover || json.cover;
    novel.genre = json.genres?.map(genre => genre.name.toLowerCase()) || novel.genre || [];
    novel.tag = json.tag?.toLowerCase().split("|").filter(t => t && t.trim().length) || novel.tag || [];
    novel.releasedChapterCount = json.releasedChapterCount;

    if (json.promotion?.endTime) {
        const now = new Date();
        const endTime = new Date(json.promotion.endTime);
        if (endTime > now) {
            if (json.promotion.promotionType === promotionType.limited_free)
                novel.status.limitedFree = endTime;
            else if (json.promotion.promotionType === promotionType.discount)
                novel.status.limitedDiscount = endTime
        }
    }

    let differencesCount = 0;

    Object.keys(originalJson).filter(key => !key.startsWith('_')).map(key => {
        if (JSON.stringify(originalJson[key]) !== JSON.stringify(novel[key])) differencesCount++;
    });

    if (differencesCount) novel.timestamp.updatedAt = timestamp;


    // once in a while check if the previously failed cover download would succeed now
    if(novel.cover.endsWith("default_cover.png") && Math.floor(Math.random() * 20) > 18)
        novel.cover = json.cover;

    novel.cover = await downloadCover(novel);

    return await novel.save().then(success => {
        if (!differencesCount) return liveMessage.novelChecked();
        return liveMessage.novelUpdated(novel)
    }).catch(err => liveMessage.novelUpdateFailed(err, novel))
}


export { updateFromNovelApi }