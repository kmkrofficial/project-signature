"use client";

import React from "react";
import { AuthGuard } from "@/components/admin/AuthGuard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="min-h-screen bg-background text-foreground font-mono selection:bg-primary/30">
                <div className="flex">
                    <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
