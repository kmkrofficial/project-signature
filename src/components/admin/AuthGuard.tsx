"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";

// UX gate only: real enforcement lives in firestore.rules / storage.rules and the
// server routes, which all require the `admin` custom claim.
export function AuthGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const isLoginPage = pathname === "/admin/login";
    const [loading, setLoading] = useState(!isLoginPage);
    const [isAuthorized, setIsAuthorized] = useState(isLoginPage);

    useEffect(() => {
        if (isLoginPage) return;

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                router.push("/admin/login");
                setLoading(false);
                return;
            }

            const { claims } = await user.getIdTokenResult();
            if (claims.admin !== true) {
                router.push("/unauthorized");
                setLoading(false);
                return;
            }

            setIsAuthorized(true);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router, isLoginPage]);

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                        Authenticating Studio...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return <div className="animate-fade-in">{children}</div>;
}
