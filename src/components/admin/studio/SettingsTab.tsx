"use client";

import React from "react";
import { Database, ExternalLink } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useEmulator } from "@/lib/firebase-config";

export function SettingsTab({ postCount }: { postCount: number }) {
    return (
        <div className="animate-fade-up space-y-6">
            <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-4">
                <div className="flex items-center gap-2.5 text-foreground font-semibold text-sm">
                    <Database size={16} className="text-primary" />
                    <span>Backend & Environment Details</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Overview of current runtime environment, authentication, and Firestore connectivity.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between">
                        <span className="text-muted-foreground">Backend:</span>
                        <span className={useEmulator ? "text-primary font-bold" : "text-emerald-400 font-bold"}>
                            {useEmulator ? "Firebase Emulator Suite" : "Firebase Cloud"}
                        </span>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between">
                        <span className="text-muted-foreground">Admin Account:</span>
                        <span className="text-foreground">{auth.currentUser?.email || "Authenticated"}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between">
                        <span className="text-muted-foreground">Articles in Firestore:</span>
                        <span className="text-foreground">{postCount} articles</span>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between">
                        <span className="text-muted-foreground">Emulator UI:</span>
                        {useEmulator ? (
                            <a
                                href="http://127.0.0.1:4000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                                <span>localhost:4000</span>
                                <ExternalLink size={11} />
                            </a>
                        ) : (
                            <span className="text-muted-foreground">N/A</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
