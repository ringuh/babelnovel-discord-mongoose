import { ChapterList } from "./dtos/chapter.dto";
import { prop, getModelForClass } from "@typegoose/typegoose";
const { green, red, yellow, magenta } = require("chalk").bold;

interface NovelName {
    en: string,
    raw: string,
    canonical: string,
    historyCanonical: string,
    search: string,
    abbr: string,
    aliases: string[]
}
interface NovelTranslations {
    hiatus: boolean,
    completed: boolean,
    ignore: boolean
}

interface NovelStatus {
    isRemoved: boolean,
    isPay: boolean,
    limitedFree: Date,
    limitedDiscount: Date
}

interface NovelTimestamp {
    createdAt: string,
    updatedAt: string,
    checkedAt: string,
    successAt: string
}

interface AuthorName {
    name: string,
    enName: string,
}

export class NovelClass {
    @prop() babelId: string;
    @prop() name?: NovelName;
    @prop() cover?: string;
    @prop() author?: AuthorName;
    @prop() releasedChapterCount?: number;
    @prop() epubCount?: number;
    @prop() ratingNum?: number;
    @prop() tag?: Array<string>;
    @prop() genre?: string[];
    @prop() source?: string;
    @prop() synopsis?: string;
    @prop() status?: NovelStatus;
    @prop() translation?: NovelTranslations;
    @prop() timestamp?: NovelTimestamp;
    @prop() chapterList?: Array<ChapterList>;
}

const Novel = getModelForClass(NovelClass);

export { Novel }