"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Link2, Loader2, Lock, Trash2, X } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import { createPreviewLink, listPreviewLinks, revokePreviewLink } from "@/app/admin/actions";
import type { PreviewLinkSummary } from "@/lib/previews";

const EXPIRY_OPTIONS = [
    { days: 1, label: "1 day" },
    { days: 7, label: "7 days" },
    { days: 30, label: "30 days" },
];

interface Props {
    open: boolean;
    postId: string | undefined;
    onClose: () => void;
}

const fmt = (iso: string) =>
    new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

/** Create, copy and revoke review links for a draft. A link's token is shown once, at creation. */
export function ShareDialog({ open, postId, onClose }: Props) {
    const { addToast } = useToast();
    const dialogRef = useRef<HTMLDialogElement>(null);

    const [links, setLinks] = useState<PreviewLinkSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [label, setLabel] = useState("");
    const [days, setDays] = useState(7);
    const [lockedEmail, setLockedEmail] = useState("");
    const [createdUrl, setCreatedUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        else if (!open && dialog.open) dialog.close();
    }, [open]);

    const idToken = useCallback(async () => {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error("Not signed in");
        return token;
    }, []);

    // Load existing links each time the dialog opens
    useEffect(() => {
        if (!open || !postId) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const result = await listPreviewLinks(await idToken(), postId);
                if (!cancelled) setLinks(result);
            } catch {
                if (!cancelled) addToast("Couldn't load review links", "error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [open, postId, idToken, addToast]);

    const handleClose = () => {
        setCreatedUrl(null);
        setCopied(false);
        onClose();
    };

    const handleCreate = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!postId) return;
        setCreating(true);
        try {
            const { path, link } = await createPreviewLink(await idToken(), postId, {
                kind: "share",
                label,
                days,
                lockedEmail: lockedEmail.trim() || undefined,
            });
            setLinks((prev) => [link, ...prev]);
            setCreatedUrl(window.location.origin + path);
            setCopied(false);
            setLabel("");
            setLockedEmail("");
        } catch (err) {
            addToast(err instanceof Error && err.message ? err.message : "Couldn't create the link", "error");
        } finally {
            setCreating(false);
        }
    };

    const handleCopy = async () => {
        if (!createdUrl) return;
        try {
            await navigator.clipboard.writeText(createdUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            addToast("Couldn't copy. Select the link and copy it manually.", "error");
        }
    };

    const handleRevoke = async (id: string) => {
        try {
            await revokePreviewLink(await idToken(), id);
            setLinks((prev) => prev.filter((link) => link.id !== id));
            addToast("Link revoked. It no longer works.", "success");
        } catch {
            addToast("Couldn't revoke the link", "error");
        }
    };

    return (
        <dialog
            ref={dialogRef}
            onClose={handleClose}
            onClick={(e) => e.target === dialogRef.current && handleClose()}
            aria-labelledby="share-dialog-title"
            className="confirm-dialog m-auto w-[calc(100%-2rem)] max-w-lg p-0 rounded-2xl border border-border bg-card text-foreground shadow-2xl backdrop:bg-background/70 backdrop:backdrop-blur-sm"
        >
            <div className="p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h2 id="share-dialog-title" className="text-base font-bold text-foreground">
                            Share for review
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Anyone with a link can read this draft until it expires or you revoke it. Lock it to a
                            Google account to limit it to one person.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close"
                        className="press p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_8rem] gap-3">
                        <label className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Who is it for? (optional)
                            </span>
                            <input
                                type="text"
                                value={label}
                                maxLength={80}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="e.g. Arun, technical review"
                                className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                        </label>
                        <label className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Expires
                            </span>
                            <select
                                value={days}
                                onChange={(e) => setDays(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
                            >
                                {EXPIRY_OPTIONS.map((option) => (
                                    <option key={option.days} value={option.days} className="bg-card">
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="block space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Lock to a Google account (optional)
                        </span>
                        <input
                            type="email"
                            value={lockedEmail}
                            onChange={(e) => setLockedEmail(e.target.value)}
                            placeholder="reviewer@gmail.com"
                            className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={creating || !postId}
                        className="press inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-60 cursor-pointer"
                    >
                        {creating ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                        Create link
                    </button>
                </form>

                {createdUrl && (
                    <div className="animate-fade-in space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
                        <p className="text-xs text-foreground">
                            <strong>Copy this link now.</strong> For security it can&apos;t be shown again.
                        </p>
                        <div className="flex items-center gap-2">
                            <input
                                readOnly
                                value={createdUrl}
                                onFocus={(e) => e.currentTarget.select()}
                                className="flex-1 min-w-0 px-3 py-2 bg-background border border-border rounded-lg text-[11px] font-mono text-foreground"
                            />
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="press inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-semibold cursor-pointer"
                            >
                                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Active links
                    </h3>
                    {loading ? (
                        <p className="text-xs text-muted-foreground">Loading…</p>
                    ) : links.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No active review links.</p>
                    ) : (
                        <ul className="space-y-2">
                            {links.map((link) => (
                                <li
                                    key={link.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/20 px-3 py-2.5"
                                >
                                    <div className="min-w-0 space-y-0.5">
                                        <p className="text-xs font-medium text-foreground truncate">
                                            {link.label || "Untitled link"}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Expires {fmt(link.expiresAt)} · {link.views} view{link.views === 1 ? "" : "s"}
                                        </p>
                                        {link.lockedEmail && (
                                            <p className="flex items-center gap-1 text-[11px] text-primary truncate">
                                                <Lock size={10} /> {link.lockedEmail}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRevoke(link.id)}
                                        className="press inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:border-red-500/40 hover:bg-red-500/10 text-xs text-muted-foreground hover:text-red-400 cursor-pointer shrink-0"
                                    >
                                        <Trash2 size={12} /> Revoke
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </dialog>
    );
}
