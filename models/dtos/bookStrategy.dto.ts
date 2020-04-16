import { StrategyDTO } from "./strategy.dto";

export interface BookStrategyDTO {
    strategyId: string;
    strategy: StrategyDTO;
    enabledExternalLink: boolean;
    showText: string;
    externalLink: string;
    updateTime: string;
    createTime: string;
    id: string;
}