// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE = "JSESSIONID";
const PUBLIC_PATHS = ["/login", "/register"];

const STRICT_CHECK = false;
const BACKEND_CHECK_URL = "https://s19challange-production.up.railway.app";

async function hasSession(req: NextRequest): Promise<boolean> {
    const hasCookie = req.cookies.has(AUTH_COOKIE);
    if (!hasCookie) return false;
    if (!STRICT_CHECK) return true;

    try {
        const res = await fetch(BACKEND_CHECK_URL, {
            method: "GET",
            headers: { cookie: req.headers.get("cookie") ?? "" },
        });
        return res.ok;
    } catch {
        return false;
    }
}

export async function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/api/")
    ) {
        return NextResponse.next();
    }

    const isPublic =
        PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

    const authed = await hasSession(req);

    if (isPublic) {
        if (authed) {
            const url = req.nextUrl.clone();
            url.pathname = "/";
            url.search = "";
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    if (!authed) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        const nextParam = encodeURIComponent(pathname + (search || ""));
        url.search = `?next=${nextParam}`;
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
