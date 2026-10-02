"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";

// Get admin emails from environment variable
const getAdminEmails = (): string[] => {
    const emails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
    return emails.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
};

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Bypass auth check for login page
        if (pathname === "/admin/login") {
            setLoading(false);
            return;
        }

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                router.push("/admin/login");
                setLoading(false);
                return;
            }

            // Check if user's email is in the admin list
            const adminEmails = getAdminEmails();
            const userEmail = user.email?.toLowerCase() || "";
            // If admin emails are configured, enforce check; otherwise allow authenticated user in local development
            const hasAdminAccess = adminEmails.length === 0 || adminEmails.includes(userEmail);

            if (!hasAdminAccess) {
                console.warn(`Access denied for email: ${userEmail}. Allowed emails: ${adminEmails.join(", ")}`);
                router.push("/unauthorized");
                setLoading(false);
                return;
            }

            // Session check
            const SESSION_TIMEOUT_MS = 6 * 60 * 60 * 1000; // 6 hours
            const lastAccessed = localStorage.getItem("admin_last_accessed");

            if (lastAccessed) {
                const timeSinceLastAccess = Date.now() - parseInt(lastAccessed);
                if (timeSinceLastAccess > SESSION_TIMEOUT_MS) {
                    await auth.signOut();
                    localStorage.removeItem("admin_last_accessed");
                    router.push("/admin/login");
                    return;
                }
            }

            localStorage.setItem("admin_last_accessed", Date.now().toString());
            setIsAuthorized(true);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router, pathname]);

    // If on login page, just render children
    if (pathname === "/admin/login") {
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

    return <>{children}</>;
}
