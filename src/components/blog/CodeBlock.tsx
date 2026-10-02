"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
    language?: string;
    value: string;
}

export function CodeBlock({ language = "text", value }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const cleanLang = language.replace("language-", "").trim().toLowerCase();

    return (
        <div className="relative my-6 rounded-xl border border-border/80 bg-[#12141a] overflow-hidden shadow-lg group">
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-secondary/40 border-b border-border/60 text-xs font-mono">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Terminal size={13} className="text-primary" />
                    <span className="uppercase text-[11px] font-semibold text-foreground/80">{cleanLang || "code"}</span>
                </div>

                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-150 active:scale-95"
                    title="Copy code"
                >
                    {copied ? (
                        <>
                            <Check size={12} className="text-emerald-400" />
                            <span className="text-emerald-400 font-sans">Copied!</span>
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
                    style={atomDark}
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
