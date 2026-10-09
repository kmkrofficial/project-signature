import Link from "next/link";
import { clsx } from "clsx";
import { getCategoryDotClass, getTopicByName } from "@/lib/categoryUtils";

interface CategoryBadgeProps {
    category: string;
    /** Render as plain text, e.g. inside another link. */
    asText?: boolean;
    className?: string;
}

export function CategoryBadge({ category, asText = false, className }: CategoryBadgeProps) {
    const topic = getTopicByName(category);
    const content = (
        <>
            <span className={clsx("w-1.5 h-1.5 rounded-full shrink-0 transition-transform duration-200 ease-spring group-hover:scale-150", getCategoryDotClass(category))} aria-hidden="true" />
            {category}
        </>
    );
    const classes = clsx("inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground", className);

    if (asText || !topic) {
        return <span className={classes}>{content}</span>;
    }

    return (
        <Link href={`/topics/${topic.slug}`} className={clsx(classes, "hover:text-foreground transition-colors")}>
            {content}
        </Link>
    );
}
