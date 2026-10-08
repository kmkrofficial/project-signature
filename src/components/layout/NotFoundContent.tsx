import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft } from "lucide-react";

export function NotFoundContent() {
    return (
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
            <p className="animate-fade-up text-sm font-semibold text-primary">404</p>
            <h1 style={{ "--i": 1 } as CSSProperties} className="animate-fade-up stagger mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Page not found</h1>
            <p style={{ "--i": 2 } as CSSProperties} className="animate-fade-up stagger mt-4 text-muted-foreground leading-relaxed">
                The page you&apos;re looking for doesn&apos;t exist or may have moved. Try the latest articles, or press
                <kbd className="kbd mx-1.5">Ctrl K</kbd>to search.
            </p>
            <div style={{ "--i": 3 } as CSSProperties} className="animate-fade-up stagger mt-8 flex items-center justify-center gap-3">
                <Link
                    href="/"
                    className="group press inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                >
                    <ArrowLeft size={16} aria-hidden="true" className="transition-transform duration-200 ease-smooth group-hover:-translate-x-0.5" />
                    Latest articles
                </Link>
                <Link
                    href="/about"
                    className="press inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                    About this blog
                </Link>
            </div>
        </div>
    );
}
