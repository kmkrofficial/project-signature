import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background text-foreground">
            <div className="max-w-md w-full text-center">
                <FileQuestion className="mx-auto mb-4 text-primary" size={56} aria-hidden="true" />
                <h1 className="text-3xl font-bold mb-2">404 — Not Found</h1>
                <p className="text-muted-foreground mb-6 font-mono text-sm">
                    The resource you requested could not be located.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition-colors"
                >
                    <Home size={16} aria-hidden="true" /> Return Home
                </Link>
            </div>
        </div>
    );
}
