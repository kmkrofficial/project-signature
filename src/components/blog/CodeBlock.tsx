"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/components/layout/ThemeProvider";
import { clsx } from "clsx";

interface CodeBlockProps {
    language?: string;
    value: string;
}

export function CodeBlock({ language = "text", value }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);
    const { theme } = useTheme();
    const isLight = theme === "light";
    const syntaxTheme = isLight ? oneLight : atomDark;

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const cleanLang = language.replace("language-", "").trim().toLowerCase();

    return (
        <div
            className={clsx(
                "relative my-6 rounded-xl border overflow-hidden shadow-md group transition-colors",
                isLight ? "bg-[#f8fafc] border-slate-200 shadow-sm" : "bg-[#0f1117] border-border/80 shadow-lg"
            )}
        >
            {/* Header bar */}
            <div
                className={clsx(
                    "flex items-center justify-between px-4 py-2 border-b text-xs font-mono transition-colors",
                    isLight ? "bg-slate-100/90 border-slate-200 text-slate-700" : "bg-secondary/50 border-border/60 text-muted-foreground"
                )}
            >
                <div className="flex items-center gap-2">
                    <Terminal size={13} className="text-primary" />
                    <span className={clsx("uppercase text-[11px] font-semibold", isLight ? "text-slate-800" : "text-foreground/80")}>
                        {cleanLang || "code"}
                    </span>
                </div>

                <button
                    onClick={handleCopy}
                    className={clsx(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] transition-all duration-150 active:scale-95 cursor-pointer",
                        isLight
                            ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/80"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    )}
                    title="Copy code"
                >
                    {copied ? (
                        <>
                            <Check size={12} className="text-emerald-500" />
                            <span className="text-emerald-500 font-sans font-medium">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy size={12} />
                            <span className="font-sans">Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code canvas */}
            <div className="overflow-x-auto text-[13px] leading-relaxed">
                <SyntaxHighlighter
                    language={cleanLang || "text"}
                    style={syntaxTheme}
                    customStyle={{
                        margin: 0,
                        padding: "1.25rem",
                        background: "transparent",
                        fontSize: "0.85rem",
                        lineHeight: "1.65",
                    }}
                    PreTag="div"
                >
                    {value.replace(/\n$/, "")}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
