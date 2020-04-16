// https://babelnovel.com/api/books?page=0&pageSize=20
export interface PagesLastChapterDTO {
    bookId: string;
    bookCanonicalName: string;
    bookCover: string;
    bookName: string;
    content?: string;
    type?: string;
    name?: string;
    num?: number;
    publishTime?: string;
    canonicalName?: string;
    genreId?: string;
    genreName?: string;
    updateTime?: string;
    createTime?: string;
    id?: string;
}

// https://babelnovel.com/api/books/president-daddy-take-it-easy
export interface LastChapterDTO {
    id: string;
    bookId: string;
    name: string;
    num: number;
    hasContent: boolean;
    url: string;
    translatorId?: string;
    publishTime: string;
    canonicalName: string;
    isPublish?: boolean;
    summary: string;
    isBought: boolean;
    isFree: boolean;
    chapterIndex: number;
    isLimitFree: boolean;
    brick: number;
    originBrick: number;
    discountRate: number;
    type: string;
    zhSourceURL?: string;
    translateStatus?: string;
    zhTitle?: string;
}