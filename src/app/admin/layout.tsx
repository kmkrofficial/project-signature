"use client";

import React from "react";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Navigation } from "@/components/layout/Navigation"; // Reuse main nav or create specific admin nav
import { Container } from "@/components/layout/Container";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider>
            <AuthGuard>
                <div className="min-h-screen bg-background text-foreground font-mono selection:bg-primary/30">
                    {/* We can reuse the main Navigation or create a simplified Sidebar for Admin */}
                    {/* For now, let's keep it simple and just wrap content */}
                    <div className="flex">
                        <main className="flex-1 p-8">
                            <Container>
                                {children}
                            </Container>
                        </main>
                    </div>
                </div>
            </AuthGuard>
        </ThemeProvider>
    );
}
