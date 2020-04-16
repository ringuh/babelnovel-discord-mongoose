export interface BookStopNoticeDTO {
    notice: string;
    startTime?: string;
    endTime?: string;
    isShowNotice: boolean;
    enabled: boolean;
    isAlways: boolean;
    enabledExternalLink: boolean;
    showText: string;
    externalLink: string;
    annnotationId: string;
    updateTime: string;
    createTime: string;
    id: string;
}