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
            <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
                <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
