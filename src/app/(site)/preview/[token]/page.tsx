import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { ArticleSkeleton } from "@/components/blog/ArticleSkeleton";
import { ArticleView } from "@/components/blog/ArticleView";
import { PreviewUnlock } from "@/components/blog/PreviewUnlock";
import { PageContainer } from "@/components/layout/PageContainer";
import { PREVIEW_SESSION_COOKIE, resolvePreview } from "@/lib/previews";

type Props = { params: Promise<{ token: string }> };

// Drafts must never be indexed or shared by accident; the same is sent as headers (next.config.ts)
export const metadata: Metadata = {
    title: "Draft preview",
    robots: { index: false, follow: false, nocache: true },
};

export default function PreviewPage({ params }: Props) {
    return (
        <Suspense fallback={<ArticleSkeleton />}>
            <Preview params={params} />
        </Suspense>
    );
}

async function Preview({ params }: Props) {
    const { token } = await params;
    const sessionToken = (await cookies()).get(PREVIEW_SESSION_COOKIE)?.value;
    const result = await resolvePreview(token, sessionToken);

    if (result.status === "invalid") notFound();
    // Once the article is live the preview link simply leads to it
    if (result.status === "published") redirect(`/blog/${result.slug}`);

    if (result.status === "locked") {
        return (
            <PageContainer className="py-16">
                <div className="mx-auto max-w-md rounded-2xl border border-border/80 bg-card p-8 text-center space-y-4">
                    <Lock size={28} className="mx-auto text-primary" aria-hidden="true" />
                    <h1 className="text-xl font-bold text-foreground">This draft is private</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        It was shared with a specific Google account. Sign in with that account to read it.
                    </p>
                    <PreviewUnlock token={token} />
                </div>
            </PageContainer>
        );
    }

    const expires = new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(result.expiresAt));
    return (
        <ArticleView
            mode="preview"
            post={result.post}
            banner={
                <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-center text-xs text-foreground">
                    <strong>Draft preview</strong> · not published · this link expires {expires}
                </div>
            }
        />
    );
}
