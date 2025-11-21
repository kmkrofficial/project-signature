import React from "react";
import { clsx } from "clsx";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    id?: string;
}

export function Section({ children, className, id, ...props }: SectionProps) {
    return (
        <section
            id={id}
            className={clsx("py-16 md:py-24 relative overflow-hidden", className)}
            {...props}
        >
            {children}
        </section>
    );
}
