import "./globals.css";
import {AuthProvider} from "./providers/AuthProvider";
import {ThemeProvider} from "./providers/ThemeProvider";
import type {Metadata} from "next";
import type {ReactNode} from "react";

export const metadata: Metadata = {title: "Twitter Clone"};

export default function RootLayout({children}: { children: ReactNode }) {
    return (
        <html lang="tr">
        <body className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
        <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
