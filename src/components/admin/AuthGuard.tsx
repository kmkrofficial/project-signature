"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Terminal, ShieldAlert } from "lucide-react";

// Get admin emails from environment variable
const getAdminEmails = (): string[] => {
    const emails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
    return emails.split(",").map(email => email.trim().toLowerCase()).filter(Boolean);
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
            const hasAdminAccess = adminEmails.includes(userEmail);

            if (!hasAdminAccess) {
                console.warn(`Access denied for email: ${userEmail}. Allowed emails: ${adminEmails.join(", ")}`);
                router.push("/unauthorized");
                setLoading(false);
                return;
            }

            // Initial Session Check
            const SESSION_TIMEOUT_MS = 6 * 60 * 60 * 1000; // 6 hours
            const lastAccessed = localStorage.getItem('admin_last_accessed');

            if (lastAccessed) {
                const timeSinceLastAccess = Date.now() - parseInt(lastAccessed);
                if (timeSinceLastAccess > SESSION_TIMEOUT_MS) {
                    await auth.signOut();
                    localStorage.removeItem('admin_last_accessed');
                    router.push("/admin/login");
                    return;
                }
            }

            // Update access time on successful auth check
            localStorage.setItem('admin_last_accessed', Date.now().toString());

            setIsAuthorized(true);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router, pathname]);

    // Activity tracking and periodic session check
    useEffect(() => {
        if (!isAuthorized) return;

        const updateLastAccessed = () => {
            localStorage.setItem('admin_last_accessed', Date.now().toString());
        };

        const checkSession = async () => {
            const SESSION_TIMEOUT_MS = 6 * 60 * 60 * 1000; // 6 hours
            const lastAccessed = localStorage.getItem('admin_last_accessed');
            if (lastAccessed) {
                const timeSinceLastAccess = Date.now() - parseInt(lastAccessed);
                if (timeSinceLastAccess > SESSION_TIMEOUT_MS) {
                    await auth.signOut();
                    localStorage.removeItem('admin_last_accessed');
                    router.push("/admin/login");
                }
            }
        };

        window.addEventListener('mousemove', updateLastAccessed);
        window.addEventListener('keydown', updateLastAccessed);
        window.addEventListener('click', updateLastAccessed);

        const interval = setInterval(checkSession, 60 * 1000); // Check every minute

        return () => {
            window.removeEventListener('mousemove', updateLastAccessed);
            window.removeEventListener('keydown', updateLastAccessed);
            window.removeEventListener('click', updateLastAccessed);
            clearInterval(interval);
        };
    }, [isAuthorized, router]);

    // If on login page, just render children
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background text-primary">
                <div className="flex flex-col items-center gap-4">
                    <Terminal className="animate-pulse" size={48} />
                    <p className="font-mono text-sm tracking-wider">AUTHENTICATING...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        // If not authorized and no user, we are redirecting, so show loading or nothing
        if (!auth.currentUser) {
            return (
                <div className="h-screen w-full flex items-center justify-center bg-background text-primary">
                    <div className="flex flex-col items-center gap-4">
                        <Terminal className="animate-pulse" size={48} />
                        <p className="font-mono text-sm tracking-wider">REDIRECTING...</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4 text-center max-w-md p-6">
                    <ShieldAlert className="text-red-500" size={64} />
                    <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
                    <p className="text-muted-foreground">
                        You are not authorized to access this area.
                    </p>
                    {auth.currentUser && (
                        <div className="mt-2 p-3 bg-secondary/50 rounded-lg border border-border">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Account</p>
                            <p className="font-mono text-sm">{auth.currentUser.email}</p>
                        </div>
                    )}
                    <button
                        onClick={() => auth.signOut().then(() => router.push("/admin/login"))}
                        className="mt-4 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
