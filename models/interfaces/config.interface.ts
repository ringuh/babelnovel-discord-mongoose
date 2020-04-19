export interface ConfigInterface {
    identifier: string;
    discord_token: string;
    prefix: string;
    bypass_list: string[];
    bypass_bots: string[];
    api: Api;
    numerics: Numerics;
    bad_requests: string[];
}

interface Numerics {
    message_lifespan: number;
    latest_chapter_count: number;
    latest_chapter_limit: number;
    novel_chapters_count: number;
    puppeteer_request_delay: number;
    puppeteer_busy_duration: number;
    retry_after: number;
}

interface Api {
    latest_chapters: string;
    novels: string;
    novel: string;
    novel_home: string;
    novel_chapters: string;
    chapter: string;
    chapter_groups: string;
}