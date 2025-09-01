import { headers } from "next/headers";

export function looksJson(ct: string | null): boolean {
    return (ct ?? "").toLowerCase().includes("application/json");
}

export async function getNextOrigin(): Promise<string> {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    if (!host) throw new Error("Host header missing; cannot build absolute URL.");
    return `${proto}://${host}`;
}

export async function getBaseUrl(): Promise<string> {
    const env =
        process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_BASE_URL ?? "";
    if (env) return env.replace(/\/+$/, "");
    return await getNextOrigin();
}


export async function getApiUrl(path: string): Promise<string> {
    const base = await getBaseUrl();
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    const hasEnv =
        !!process.env.NEXT_PUBLIC_API_BASE || !!process.env.NEXT_PUBLIC_BASE_URL;

    if (hasEnv) {
        return `${base}${cleanPath}`;
    }
    return `${base}/api${cleanPath}`;
}
