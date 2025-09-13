// server-url.ts
import { headers } from "next/headers";

export function looksJson(ct: string | null): boolean {
    return (ct ?? "").toLowerCase().includes("application/json");
}

export async function getNextOrigin(): Promise<string> {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "https";
    if (!host) throw new Error("Host header missing");
    return `${proto}://${host}`;
}

function trimSlashes(s: string): string {
    return s.replace(/\/+$/, "");
}

function normalizePath(p: string): string {
    return p.startsWith("/") ? p : `/${p}`;
}

export async function getBaseUrl(): Promise<string> {
    return trimSlashes(await getNextOrigin());
}

export async function getApiUrl(path: string): Promise<string> {
    const base = await getBaseUrl();
    return `${base}${normalizePath(path)}`;
}
