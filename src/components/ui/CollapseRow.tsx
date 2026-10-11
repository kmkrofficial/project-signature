import type { CSSProperties, ReactNode } from "react";

interface CollapseRowProps {
    /** Collapses the row out of the layout (its siblings glide up). */
    leaving?: boolean;
    /** Position in the list, for the entrance stagger. */
    index?: number;
    className?: string;
    children: ReactNode;
}

/** List row that fades in on mount and collapses smoothly when removed. Spacing between rows is built in. */
export function CollapseRow({ leaving = false, index = 0, className, children }: CollapseRowProps) {
    return (
        <div className="collapse-row" data-leaving={leaving || undefined}>
            <div className="animate-fade-up stagger" style={{ "--i": index } as CSSProperties}>
                <div className="pb-3">
                    <div className={className}>{children}</div>
                </div>
            </div>
        </div>
    );
}
