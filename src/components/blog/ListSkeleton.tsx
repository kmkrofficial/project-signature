import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";

/** Loading state for the home and topic pages: the spotlight card, topic pills and a few rows. */
export function ListSkeleton() {
    return (
        <PageContainer>
            <div role="status" aria-label="Loading articles">
                <span className="sr-only">Loading articles…</span>

                <div className="mb-10 sm:mb-12 grid gap-4 md:grid-cols-[5fr_7fr] md:items-center md:gap-8 rounded-[28px] border border-border/80 bg-card p-3 sm:p-4 md:min-h-[241px]">
                    <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
                    <div className="space-y-3 px-2 pb-2 md:p-0 md:pr-4">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-8 w-11/12" />
                        <Skeleton className="h-8 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-3 w-40" />
                    </div>
                </div>

                <Skeleton className="mb-4 h-4 w-36" />
                <div className="mb-4 flex gap-2">
                    {["w-12", "w-[150px]", "w-[126px]", "w-[110px]", "w-[112px]"].map((width) => (
                        <Skeleton key={width} className={`h-[34px] shrink-0 rounded-full ${width}`} />
                    ))}
                </div>

                <div className="divide-y divide-border/60">
                    {[0, 1, 2, 3].map((row) => (
                        <div key={row} className="min-h-[125px] space-y-3 py-5">
                            <Skeleton className="h-3 w-56" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </PageContainer>
    );
}
