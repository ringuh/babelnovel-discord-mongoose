import { GroupChapterDTO } from "./chapter.dto";

export interface chapterGroupDTO {
    page: number;
    firstChapter: GroupChapterDTO;
    lastChapter: GroupChapterDTO;
}