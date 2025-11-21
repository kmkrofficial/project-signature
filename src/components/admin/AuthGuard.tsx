"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Terminal } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push("/admin/login");
            } else {
                setUser(currentUser);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

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

    if (!user) return null;

    return <>{children}</>;
}
