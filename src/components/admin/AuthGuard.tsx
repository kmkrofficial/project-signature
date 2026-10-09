"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { claimAdminAccess } from "@/app/admin/actions";

// UX gate only: real enforcement lives in firestore.rules / storage.rules and the
// server routes, which all require the `admin` custom claim. An allowlisted admin
// (ADMIN_EMAILS) gets that claim from the server on first sign-in.
export function AuthGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const isLoginPage = pathname === "/admin/login";
    const [loading, setLoading] = useState(!isLoginPage);
    const [isAuthorized, setIsAuthorized] = useState(isLoginPage);
    const [unavailable, setUnavailable] = useState(false);

    useEffect(() => {
        if (isLoginPage) return;

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                router.push("/admin/login");
                setLoading(false);
                return;
            }

            let { claims } = await user.getIdTokenResult();

            if (claims.admin !== true) {
                const result = await claimAdminAccess(await user.getIdToken()).catch(() => "unavailable" as const);
                if (result === "unavailable") {
                    setUnavailable(true);
                    setLoading(false);
                    return;
                }
                if (result === "granted" || result === "already") {
                    // Pick up the new claim without asking the user to sign in again
                    claims = (await user.getIdTokenResult(true)).claims;
                }
            }

            if (claims.admin !== true) {
                router.push("/unauthorized");
                setLoading(false);
                return;
            }

            setUnavailable(false);
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

    if (unavailable) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-background px-6 text-foreground">
                <div className="flex max-w-md flex-col items-center gap-4 text-center">
                    <h1 className="text-2xl font-bold">Couldn&apos;t verify your access</h1>
                    <p className="text-muted-foreground">
                        The server couldn&apos;t check your account just now. This usually means its Firebase
                        credentials aren&apos;t set up for this environment. Try again, or sign out and back in.
                    </p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="press cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Try again
                        </button>
                        <button
                            type="button"
                            onClick={async () => {
                                await auth.signOut();
                                router.push("/admin/login");
                            }}
                            className="press cursor-pointer rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
