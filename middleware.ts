// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE = "access_token";
const PUBLIC_PATHS = ["/login", "/register"];

function isPublic(pathname: string) {
    return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    // statik dosyalar ve API dışarıda bırakılır
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/api/")
    ) {
        return NextResponse.next();
    }

    const token = req.cookies.get(AUTH_COOKIE)?.value;

    if (isPublic(pathname)) {
        if (token) {
            const url = req.nextUrl.clone();
            url.pathname = "/";
            url.search = "";
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.search = `?next=${encodeURIComponent(pathname + (search || ""))}`;
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
