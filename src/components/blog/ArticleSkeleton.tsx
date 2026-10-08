import { Skeleton } from "@/components/ui/Skeleton";

/** Loading state for an article. Uses the same container, columns and spacing as the real page so nothing shifts when content arrives. */
export function ArticleSkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-12" role="status" aria-label="Loading article">
            <span className="sr-only">Loading article…</span>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-10 xl:gap-16">
                <div className="min-w-0 max-w-3xl">
                    <Skeleton className="mb-6 h-4 w-24" />

                    <div className="mb-8 space-y-4">
                        <Skeleton className="h-4 w-28" />
                        <div className="space-y-3">
                            <Skeleton className="h-9 w-11/12 sm:h-11" />
                            <Skeleton className="h-9 w-2/3 sm:h-11" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-4/5" />
                        </div>
                        <Skeleton className="h-4 w-48" />
                    </div>

                    <Skeleton className="mb-10 aspect-[16/9] w-full rounded-2xl" />

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-[98%]" />
                            <Skeleton className="h-4 w-[94%]" />
                            <Skeleton className="h-4 w-[82%]" />
                        </div>
                        <Skeleton className="h-7 w-1/2" />
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-[96%]" />
                            <Skeleton className="h-4 w-[90%]" />
                            <Skeleton className="h-4 w-[70%]" />
                        </div>
                        <Skeleton className="h-28 w-full rounded-xl" />
                    </div>
                </div>

                <div className="hidden lg:block">
                    <div className="sticky top-24 space-y-3">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-44" />
                    </div>
                </div>
            </div>
        </div>
    );
}
