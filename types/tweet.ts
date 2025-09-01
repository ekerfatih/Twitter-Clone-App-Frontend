export type Tweet = {
    id: number;
    tweetText: string;
    username: string;
    time: string;
    commentCount: number;
    likeCount: number;
    retweetCount: number;
    likedByMe: boolean;
    retweetByMe: boolean;
};

export function isTweet(x: unknown): x is Tweet {
    if (typeof x !== "object" || x === null) return false;
    const o = x as Record<PropertyKey, unknown>;
    return (
        typeof o.id === "number" &&
        typeof o.tweetText === "string" &&
        typeof o.username === "string" &&
        typeof o.time === "string" &&
        typeof o.commentCount === "number" &&
        typeof o.likeCount === "number" &&
        typeof o.retweetCount === "number" &&
        typeof o.likedByMe === "boolean" &&
        typeof o.retweetByMe === "boolean"
    );
}

export function isTweetArray(x: unknown): x is Tweet[] {
    return Array.isArray(x) && x.every(isTweet);
}
