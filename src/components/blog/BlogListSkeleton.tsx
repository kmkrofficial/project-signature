import React from "react";

export function BlogListSkeleton() {
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6 animate-in fade-in duration-300">
            {/* Spotlight Placeholder */}
            <div className="mb-8 sm:mb-10 w-full rounded-2xl sm:rounded-3xl border border-border/80 bg-card/60 p-6 md:h-[310px] grid grid-cols-1 md:grid-cols-12 gap-6 animate-pulse">
                <div className="md:col-span-5 aspect-[16/10] md:aspect-auto rounded-xl bg-secondary/50" />
                <div className="md:col-span-7 flex flex-col justify-between py-2 space-y-4">
                    <div className="space-y-3">
                        <div className="w-28 h-5 rounded-full bg-secondary/70" />
                        <div className="w-4/5 h-7 rounded-xl bg-secondary/80" />
                        <div className="w-full h-4 rounded-lg bg-secondary/50" />
                        <div className="w-2/3 h-4 rounded-lg bg-secondary/40" />
                    </div>
                    <div className="w-32 h-4 rounded bg-secondary/60" />
                </div>
            </div>

            {/* Category Pills Placeholder */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 w-24 rounded-full bg-secondary/60 animate-pulse shrink-0" />
                ))}
            </div>

            {/* Article Cards Placeholder */}
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 animate-pulse">
                        <div className="flex gap-2 items-center">
                            <div className="w-20 h-4 rounded-full bg-secondary/70" />
                            <div className="w-16 h-3 rounded bg-secondary/50" />
                        </div>
                        <div className="w-3/4 h-6 rounded-lg bg-secondary/80" />
                        <div className="w-full h-4 rounded bg-secondary/40" />
                    </div>
                ))}
            </div>
        </div>
    );
}
