import { useEffect, useState } from "react";
import { isSlugTaken } from "../posts-client";

export type SlugStatus = "idle" | "checking" | "taken" | "ok";

const CHECK_DELAY_MS = 400;

/** Debounced "is this URL already used by another article?" check for the slug field. */
export function useSlugCheck(slug: string, postId: string | undefined, enabled: boolean): SlugStatus {
    const [result, setResult] = useState<{ slug: string; taken: boolean } | null>(null);

    useEffect(() => {
        if (!enabled || !slug) return;
        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const taken = await isSlugTaken(slug, postId);
                if (!cancelled) setResult({ slug, taken });
            } catch {
                // A failed check never blocks writing; saving re-checks
            }
        }, CHECK_DELAY_MS);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [slug, postId, enabled]);

    if (!enabled || !slug) return "idle";
    if (result?.slug !== slug) return "checking";
    return result.taken ? "taken" : "ok";
}
