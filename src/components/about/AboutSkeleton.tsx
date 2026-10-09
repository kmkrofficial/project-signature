import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";

/** Loading state for the About page: profile card, intro text, topic cards and repo cards. */
export function AboutSkeleton() {
    return (
        <PageContainer>
            <div role="status" aria-label="Loading About page" className="space-y-10 sm:space-y-12">
                <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <Skeleton className="h-[72px] w-[72px] sm:h-20 sm:w-20 shrink-0 rounded-2xl" />
                        <div className="flex-1 space-y-3">
                            <Skeleton className="h-8 w-64 max-w-full" />
                            <Skeleton className="h-4 w-80 max-w-full" />
                        </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2 border-t border-border/60 pt-6">
                        {["w-24", "w-28", "w-20", "w-28"].map((width, index) => (
                            <Skeleton key={index} className={`h-8 rounded-xl ${width}`} />
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-11/12" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>

                <div className="space-y-4">
                    <Skeleton className="h-7 w-56" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[0, 1, 2].map((card) => (
                            <div key={card} className="space-y-3 rounded-xl border border-border/80 bg-card p-5">
                                <Skeleton className="h-9 w-9 rounded-lg" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-5/6" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-5">
                    <Skeleton className="h-7 w-44" />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {[0, 1, 2, 3].map((card) => (
                            <div key={card} className="space-y-3 rounded-2xl border border-border/80 bg-card p-5">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                                <Skeleton className="mt-2 h-3 w-24" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
