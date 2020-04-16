import { LastChapterDTO } from "./lastChapter.dto";
import { GenreDTO } from "./genre.dto";


export interface PageApiDTO {
    lastChapter: LastChapterDTO;
    publisher?: string;
    genres?: GenreDTO[];
    genreIds?: Array<string>;
    inBookList?: boolean;
    notification?: boolean;
    authorId?: string;
    isCopyrightAuthorized?: number;
    cover?: string;
    volume?: string;
    editorId?: string;
    name?: string;
    originRefId?: string;
    publisherId?: string;
    publishTime?: string;
    synopsis?: string;
    tag?: string;
    translatorId?: string;
    enSerial?: string;
    status?: number;
    alias?: string;
    canonicalName?: string;
    cnName?: string;
    copyright?: string;
    historyCanonicalName?: string;
    serial?: string;
    subTitle?: string;
    ratingNum?: number;
    releasedChapterCount?: number;
    cpEnCompanyName?: string;
    sensitivityRating?: string;
    updateTime?: string;
    createTime?: string;
    id?: string;
}

