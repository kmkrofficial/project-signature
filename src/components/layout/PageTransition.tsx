import { ViewTransition } from "react";

const pageAnimation = {
    "nav-forward": "nav-forward",
    "nav-back": "nav-back",
    default: "page-fade",
} as const;

/** Wrap each page's content (not layouts, which persist and never enter or exit). */
export function PageTransition({ children }: { children: React.ReactNode }) {
    return (
        <ViewTransition enter={pageAnimation} exit={pageAnimation} default="none">
            {children}
        </ViewTransition>
    );
}
