import { clsx } from "clsx";

/**
 * One content width and one set of paddings for the home, topic and About pages, and for their loading
 * skeletons, so moving between them never shifts the layout.
 */
export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={clsx("max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-10 sm:pb-16", className)}>{children}</div>;
}
