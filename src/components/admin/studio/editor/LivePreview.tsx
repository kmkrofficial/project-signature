"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { auth } from "@/lib/firebase";
import { renderPreview } from "@/app/admin/actions";
import { Skeleton } from "@/components/ui/Skeleton";

const RENDER_DELAY_MS = 600;

interface Props {
    title: string;
    excerpt: string;
    content: string;
    className?: string;
    /** CSS height of the scroll area, so it can match the editor next to it. */
    height?: string;
}

/**
 * The article as readers will see it, rendered by the server with the same markdown pipeline
 * (sanitizing, syntax highlighting, figures) that the public site uses.
 */
export function LivePreview({ title, excerpt, content, className, height }: Props) {
    const [html, setHtml] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const token = await auth.currentUser?.getIdToken();
                if (!token) return;
                const result = await renderPreview(token, content);
                if (cancelled) return;
                setHtml(result.html);
                setFailed(false);
            } catch {
                if (!cancelled) setFailed(true);
            }
        }, RENDER_DELAY_MS);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [content]);

    return (
        <div className={className} style={height ? { height } : undefined}>
            <div className="mx-auto max-w-3xl p-6 sm:p-8">
                {title && (
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight text-balance">
                        {title}
                    </h1>
                )}
                {excerpt && <p className="mt-3 text-lg text-muted-foreground leading-relaxed">{excerpt}</p>}

                {failed && (
                    <p className="mt-4 flex items-center gap-2 text-xs text-amber-400" role="alert">
                        <AlertCircle size={14} /> Preview couldn&apos;t be refreshed. Your text is safe.
                    </p>
                )}

                {html === null ? (
                    <div className="mt-8 space-y-3" aria-hidden="true">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-11/12" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ) : html ? (
                    <div
                        className="article-prose prose prose-neutral dark:prose-invert max-w-none mt-8"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                ) : (
                    <p className="mt-8 text-sm text-muted-foreground">Nothing to preview yet.</p>
                )}
            </div>
        </div>
    );
}
