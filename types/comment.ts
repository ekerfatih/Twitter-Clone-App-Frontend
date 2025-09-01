export type Comment = {
    id: number;
    commentText: string;
    username: string;
    time: string;
};

function isRecord(x: unknown): x is Record<string, unknown> {
    return typeof x === "object" && x !== null;
}

export function isComment(x: unknown): x is Comment {
    if (!isRecord(x)) return false;
    return (
        typeof x.id === "number" &&
        typeof x.commentText === "string" &&
        typeof x.username === "string" &&
        typeof x.time === "string"
    );
}

export function isCommentArray(x: unknown): x is Comment[] {
    return Array.isArray(x) && x.every(isComment);
}
