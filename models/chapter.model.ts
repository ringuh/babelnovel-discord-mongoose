import { getModelForClass, prop } from "@typegoose/typegoose";

interface ChapterContent {
    raw?: string,
    babel?: string,
    initial?: string,
    proofread?: string,
}

interface ChapterTimestamp {
    createdAt: string,
    updatedAt: string,
    checkedAt: string,
    successAt: string,
    attemptedAt: string,
}

interface ChapterStatus {
    skip?: boolean,
    ignore?: boolean,
    attempts?: number,
}

export class Chapters {
    @prop() babelId: string;
    @prop() novelId: string;
    @prop() prevId?: string;
    @prop() nextId?: string;
    @prop() num?: number;
    @prop() index?: number;
    @prop() name?: string;
    @prop() canonicalName?: string;
    @prop() content?: ChapterContent;
    @prop() status?: ChapterStatus;
    @prop() zhSourceURL?: string;
    @prop() zhTitle?: string;
    @prop() timestamp?: ChapterTimestamp;
    @prop() originalData?: any;
}


const Chapter = getModelForClass(Chapters)

export { Chapter };