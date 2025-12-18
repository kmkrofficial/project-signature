"use client";

import React from "react";
import { ImageManager } from "@/components/admin/ImageManager";
import { Container } from "@/components/layout/Container";
import { ArrowLeft, LogOut } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

export default function ImageManagementPage() {
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/admin/login");
    };

    return (
        <div className="min-h-screen bg-background pt-20 pb-10">
            <Container>
                <header className="flex justify-between items-center mb-10 border-b border-border pb-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="p-2 hover:bg-primary/10 text-primary rounded transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-3xl font-bold font-mono">IMAGE // MANAGER</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </header>

                <div className="bg-card border border-border rounded-lg p-6 min-h-[600px]">
                    <ImageManager mode="full" />
                </div>
            </Container>
        </div>
    );
}
