"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { CheckCircle2, Database, ExternalLink, Loader2, Save } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { useEmulator } from "@/lib/firebase-config";
import { useToast } from "@/context/ToastContext";

interface SiteForm {
    siteTitle: string;
    siteDescription: string;
    author: string;
    email: string;
    github: string;
    linkedin: string;
    twitter: string;
}

const EMPTY: SiteForm = {
    siteTitle: "",
    siteDescription: "",
    author: "",
    email: "",
    github: "",
    linkedin: "",
    twitter: "",
};

const FIELDS: { key: keyof SiteForm; label: string; hint: string; type?: "textarea" | "email" | "url" }[] = [
    { key: "siteTitle", label: "Site title", hint: "Browser tab and search results" },
    { key: "siteDescription", label: "Site description", hint: "One or two sentences for search and social cards", type: "textarea" },
    { key: "author", label: "Author name", hint: "Shown as the byline and in structured data" },
    { key: "email", label: "Contact email", hint: "Used by the footer's mail link", type: "email" },
    { key: "github", label: "GitHub URL", hint: "https://github.com/you", type: "url" },
    { key: "linkedin", label: "LinkedIn URL", hint: "https://linkedin.com/in/you", type: "url" },
    { key: "twitter", label: "X / Twitter URL", hint: "Optional", type: "url" },
];

/** Returns an error message, or null when the value is acceptable. */
function validate(form: SiteForm): string | null {
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Contact email is not a valid address";
    for (const key of ["github", "linkedin", "twitter"] as const) {
        if (form[key] && !/^https:\/\/\S+$/.test(form[key])) return `${key} must be a full https:// link`;
    }
    return null;
}

interface Props {
    postCount: number;
    /** Called after the settings were written, to refresh the cached public site. */
    onSaved: () => Promise<void>;
}

export function SettingsTab({ postCount, onSaved }: Props) {
    const { addToast } = useToast();
    const [form, setForm] = useState<SiteForm>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = (await getDoc(doc(db, "config", "site"))).data() ?? {};
                if (cancelled) return;
                setForm((prev) => {
                    const next = { ...prev };
                    for (const key of Object.keys(EMPTY) as (keyof SiteForm)[]) {
                        if (typeof data[key] === "string") next[key] = data[key];
                    }
                    return next;
                });
            } catch (err) {
                console.warn("Could not load site settings:", err);
                if (!cancelled) addToast("Could not load the site settings", "error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [addToast]);

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        const problem = validate(form);
        if (problem) {
            addToast(problem, "error");
            return;
        }

        setSaving(true);
        try {
            const trimmed = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
            await setDoc(doc(db, "config", "site"), trimmed, { merge: true });
            await onSaved();
            addToast("Site settings saved", "success");
        } catch (err: unknown) {
            addToast("Failed to save settings: " + (err instanceof Error ? err.message : String(err)), "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-up space-y-6">
            <form onSubmit={handleSave} className="p-5 rounded-2xl bg-card border border-border/80 space-y-5">
                <div className="space-y-1">
                    <h2 className="text-sm font-semibold text-foreground">Site settings</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Used across the site. Anything left empty falls back to the built-in default.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {FIELDS.map((field) => (
                        <label
                            key={field.key}
                            className={field.type === "textarea" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}
                        >
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {field.label}
                            </span>
                            {field.type === "textarea" ? (
                                <textarea
                                    rows={2}
                                    value={form[field.key]}
                                    disabled={loading}
                                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                    placeholder={field.hint}
                                    className="w-full px-3.5 py-2 bg-secondary/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-colors resize-none disabled:opacity-60"
                                />
                            ) : (
                                <input
                                    type={field.type ?? "text"}
                                    value={form[field.key]}
                                    disabled={loading}
                                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                    placeholder={field.hint}
                                    className="w-full px-3.5 py-2 bg-secondary/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
                                />
                            )}
                        </label>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={loading || saving}
                    className="press inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-60 cursor-pointer"
                >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save settings
                </button>
            </form>

            <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-3">
                <div className="flex items-center gap-2.5 text-foreground font-semibold text-sm">
                    {useEmulator ? (
                        <Database size={16} className="text-primary" />
                    ) : (
                        <CheckCircle2 size={16} className="text-emerald-400" />
                    )}
                    <span>Environment</span>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Backend</dt>
                        <dd className={useEmulator ? "text-primary font-bold" : "text-emerald-400 font-bold"}>
                            {useEmulator ? "Firebase Emulator Suite" : "Firebase Cloud"}
                        </dd>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Signed in as</dt>
                        <dd className="text-foreground truncate">{auth.currentUser?.email || "Authenticated"}</dd>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Articles</dt>
                        <dd className="text-foreground">{postCount}</dd>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Emulator UI</dt>
                        <dd>
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
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}
