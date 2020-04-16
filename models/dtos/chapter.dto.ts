export interface NovelChapterDTO {
    id: string;
    name: string;
    canonicalName: string;
    type: string;
    publishTime: string;
    isBought: boolean;
    isFree: boolean;
    isLimitFree: boolean;
    brick: number;
    originBrick: number;
    translatorId?: any;
}

export interface GroupChapterDTO {
    canonicalName: string;
    num: number;
    id: string;
    name: string;
}


export interface ChapterList {
    babelId: string;
    index: number;
    canonicalName: string;
    content: boolean;
    hash?: string;
    isAnnounced?: boolean;
}

export interface ChapterDTO {
    prevId: string;
    nextId: string;
    index: number;
    brick: number;
    isFree: boolean;
    isBought: boolean;
    isBorrowed: boolean;
    chapterOrderId?: string;
    isLimitFree: boolean;
    originBrick: number;
    discountRate: number;
    expireTime?: string;
    bookId: string;
    content: string;
    url: string;
    type: string;
    zhSourceURL?: string;
    zhTitle?: string;
    name: string;
    num: number;
    publishTime: string;
    translatorId?: string;
    canonicalName: string;
    translateStatus: string;
    voteId?: string;
    isPublish: boolean;
    updateTime: string;
    createTime: string;
    id: string;
}