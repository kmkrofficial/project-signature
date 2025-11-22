"use client";

import { ShieldX } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-6 text-center max-w-lg px-6">
                <ShieldX className="text-red-500" size={96} />
                <h1 className="text-4xl font-bold text-foreground">Access Denied</h1>
                <p className="text-muted-foreground text-lg">
                    You do not have administrator permissions to access this area.
                </p>
                <p className="text-sm text-muted-foreground">
                    This section is restricted to authorized administrators only.
                    If you believe you should have access, please contact the site administrator.
                </p>
                <Link
                    href="/"
                    className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Return to Homepage
                </Link>
            </div>
        </div>
    );
}
