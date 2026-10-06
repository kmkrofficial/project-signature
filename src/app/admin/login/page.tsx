"use client";

import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Sparkles, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { GoogleAuthProvider, browserSessionPersistence, setPersistence, signInWithPopup } from "firebase/auth";
import Link from "next/link";

export default function LoginPage() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            // Session persistence: admin sign-in ends when the browser closes
            await setPersistence(auth, browserSessionPersistence);
            await signInWithPopup(auth, new GoogleAuthProvider());
            router.push("/admin");
        } catch (err: unknown) {
            console.error("Login error:", err);
            setError("Sign-in failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
            {/* Top Back Navigation Button */}
            <div className="w-full max-w-md mb-3">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-primary" />
                    <span>Back to Articles</span>
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md bg-card border border-border/80 p-8 rounded-2xl shadow-xl relative"
            >
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-mono">
                        <Sparkles size={13} />
                        <span>Admin Studio</span>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
                        Authentication
                    </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                    Studio Sign In
                </h1>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    Sign in with your authorized Google account to manage articles and site settings.
                </p>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 flex items-start gap-2.5 rounded-xl text-xs leading-relaxed">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Google Login Button */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-xl hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-3 text-sm shadow-md hover:shadow-primary/20 disabled:opacity-50 cursor-pointer"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span>{loading ? "Authenticating..." : "Continue with Google"}</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
