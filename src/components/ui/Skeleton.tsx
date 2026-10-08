import { clsx } from "clsx";

/** A loading placeholder block with a light sweep. Size and shape come from `className`. */
export function Skeleton({ className }: { className?: string }) {
    return <div aria-hidden="true" className={clsx("skeleton", className)} />;
}
