export enum promotionType {
    discount = "discount",
    limit_free = "limit_free"
}

export interface PromotionDTO {
    beginTime: string;
    endTime: string;
    cutoffSeconds: number;
    timeSpan: string;
    isShowPromotionTime: boolean;
    isShowLimitFreeTime: boolean;
    promotionType: promotionType;
    showTimeType: string;
    isShowDescription: boolean;
    descriptionType: string;
    customDescription?: any;
}