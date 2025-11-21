"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Terminal, Lock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/admin");
        } catch (err) {
            setError("Access Denied: Invalid Credentials");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-card border border-border p-8 rounded-lg shadow-2xl relative overflow-hidden"
            >
                {/* Decorative header line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

                <div className="flex items-center gap-3 mb-8 text-primary">
                    <Terminal size={24} />
                    <h1 className="text-xl font-bold tracking-wider">SYSTEM ADMIN // LOGIN</h1>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 flex items-center gap-2 rounded text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                            Identifier
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                            placeholder="admin@system.local"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                            Access Key
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute right-3 top-3 text-muted-foreground" size={18} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground font-bold py-3 rounded hover:bg-primary/90 transition-colors uppercase tracking-widest text-sm"
                    >
                        Authenticate
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
