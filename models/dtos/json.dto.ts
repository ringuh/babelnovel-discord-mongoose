import { chapterGroupDTO } from "./chapterGroup.dto";

export interface jsonDTO {
    code: number,
    data: any
}

export interface ChapterGroupJsonDTO {
    code: number,
    data: chapterGroupDTO[]
}