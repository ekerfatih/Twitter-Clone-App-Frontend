"use client";

import {createContext, useContext, useEffect, useState} from "react";

type AuthState = { username?: string } | null;

type Ctx = {
    auth: AuthState;
    setAuth: (a: AuthState) => void;
    logoutUiOnly: () => void;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [auth, setAuthState] = useState<AuthState>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("auth");
            if (raw) setAuthState(JSON.parse(raw));
        } catch {
        }
    }, []);

    const setAuth = (a: AuthState) => {
        setAuthState(a);
        try {
            if (a) localStorage.setItem("auth", JSON.stringify(a));
            else localStorage.removeItem("auth");
        } catch {
        }
    };

    const logoutUiOnly = () => setAuth(null);

    return (
        <AuthContext.Provider value={{auth, setAuth, logoutUiOnly}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
