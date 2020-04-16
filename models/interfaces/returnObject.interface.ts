import { CodeList } from "../enums/codeList.enum";

export interface ReturnObject {
    code: CodeList,
    message?: string,
    value?: any
}