import React from "react";
import { ArrowLeft } from "lucide-react";

export function ArticleSkeleton() {
    return (
        <div className="relative pb-2 sm:pb-4 animate-in fade-in duration-300">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
                {/* Back Link Placeholder */}
                <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 mb-5">
                    <ArrowLeft size={14} />
                    <span>All Articles</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 lg:gap-10 relative">
                    {/* Main Article Column */}
                    <div className="min-w-0 max-w-3xl">
                        {/* Header Skeleton */}
                        <div className="mb-7 pb-5 sm:mb-8 sm:pb-6 border-b border-border/60">
                            {/* Category Pill */}
                            <div className="w-24 h-5 rounded-full bg-secondary/70 animate-pulse mb-3.5" />

                            {/* Headline Lines */}
                            <div className="space-y-2.5 mb-4">
                                <div className="w-11/12 h-8 sm:h-10 rounded-xl bg-secondary/80 animate-pulse" />
                                <div className="w-3/4 h-8 sm:h-10 rounded-xl bg-secondary/70 animate-pulse" />
                            </div>

                            {/* Excerpt Lead Line */}
                            <div className="space-y-2 mb-4">
                                <div className="w-full h-4 rounded-lg bg-secondary/50 animate-pulse" />
                                <div className="w-5/6 h-4 rounded-lg bg-secondary/40 animate-pulse" />
                            </div>

                            {/* Meta Row */}
                            <div className="flex items-center gap-3 pt-3.5 border-t border-border/50">
                                <div className="w-20 h-3.5 rounded bg-secondary/60 animate-pulse" />
                                <div className="w-2 h-2 rounded-full bg-secondary/60" />
                                <div className="w-16 h-3.5 rounded bg-secondary/60 animate-pulse" />
                                <div className="w-2 h-2 rounded-full bg-secondary/60" />
                                <div className="w-14 h-3.5 rounded bg-secondary/60 animate-pulse" />
                            </div>
                        </div>

                        {/* Cover Image Placeholder */}
                        <div className="w-full aspect-[16/9] rounded-2xl bg-secondary/50 border border-border/60 mb-8 animate-pulse" />

                        {/* Article Reading Paragraphs */}
                        <div className="space-y-6 pt-2">
                            <div className="space-y-2.5">
                                <div className="w-full h-4 rounded bg-secondary/70 animate-pulse" />
                                <div className="w-[98%] h-4 rounded bg-secondary/60 animate-pulse" />
                                <div className="w-[94%] h-4 rounded bg-secondary/60 animate-pulse" />
                                <div className="w-[85%] h-4 rounded bg-secondary/50 animate-pulse" />
                            </div>

                            {/* Subheading Skeleton */}
                            <div className="w-1/2 h-6 rounded-lg bg-secondary/80 animate-pulse pt-2" />

                            <div className="space-y-2.5">
                                <div className="w-full h-4 rounded bg-secondary/70 animate-pulse" />
                                <div className="w-[96%] h-4 rounded bg-secondary/60 animate-pulse" />
                                <div className="w-[92%] h-4 rounded bg-secondary/60 animate-pulse" />
                                <div className="w-[78%] h-4 rounded bg-secondary/50 animate-pulse" />
                            </div>

                            {/* Code Block Skeleton */}
                            <div className="w-full h-28 rounded-xl bg-secondary/40 border border-border/60 animate-pulse" />
                        </div>
                    </div>

                    {/* Right Column: Sidebar Skeleton */}
                    <div className="hidden lg:block">
                        <div className="sticky top-20 space-y-4">
                            {/* Action Card Placeholder */}
                            <div className="p-3.5 rounded-2xl bg-card border border-border/70 space-y-2">
                                <div className="w-20 h-2.5 rounded bg-secondary/80 animate-pulse" />
                                <div className="flex gap-2">
                                    <div className="flex-1 h-8 rounded-xl bg-secondary/60 animate-pulse" />
                                    <div className="flex-1 h-8 rounded-xl bg-secondary/60 animate-pulse" />
                                </div>
                            </div>

                            {/* Table of Contents Skeleton */}
                            <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-3">
                                <div className="w-28 h-4 rounded bg-secondary/80 animate-pulse mb-4" />
                                <div className="w-40 h-3 rounded bg-secondary/60 animate-pulse" />
                                <div className="w-36 h-3 rounded bg-secondary/50 animate-pulse" />
                                <div className="w-44 h-3 rounded bg-secondary/50 animate-pulse" />
                                <div className="w-32 h-3 rounded bg-secondary/40 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
