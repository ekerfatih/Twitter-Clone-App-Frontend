export function parseLocalDateTime(s: string): Date {
    const parts = s.split(/[T.]/);
    if (parts.length < 2) return new Date(s);
    const [datePart, timePart] = parts;
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm, ss] = timePart.split(":").map(Number);
    return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, ss ?? 0));
}

export function timeAgoText(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const sec = Math.max(0, Math.floor(diffMs / 1000));
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (sec < 45) return "az önce";
    if (min < 60) return `${min} dk`;
    if (hr < 24) return `${hr} sa`;
    if (day < 7) return `${day} g`;
    return date.toLocaleDateString("tr-TR");
}
