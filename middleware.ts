import {NextRequest, NextResponse} from "next/server";

export function middleware(req: NextRequest) {
    const p = req.nextUrl.pathname;
    if (p.startsWith("/api")) {
        const t = req.cookies.get("access_token")?.value;
        if (t) {
            const h = new Headers(req.headers);
            h.set("authorization", `Bearer ${t}`);
            return NextResponse.next({request: {headers: h}});
        }
    }
    return NextResponse.next();
}

export const config = {matcher: ["/api/:path*"]};
