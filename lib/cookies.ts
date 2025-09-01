import { cookies } from "next/headers";

export async function getCookieHeader(): Promise<string> {
    const jar = await cookies();
    const pairs = jar.getAll().map(c => `${c.name}=${c.value}`);
    return pairs.join("; ");
}
