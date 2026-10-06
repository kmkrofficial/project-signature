import React from "react";
import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { Github, Linkedin, Twitter, Mail, Rss, type LucideIcon } from "lucide-react";
import { CONFIG_TAG, getSiteConfig } from "@/lib/posts";

interface FooterLink {
    href: string;
    label: string;
    icon: LucideIcon;
    external?: boolean;
}

export async function Footer() {
    "use cache";
    cacheLife("days");
    cacheTag(CONFIG_TAG);

    const config = await getSiteConfig();
    const currentYear = new Date().getFullYear();

    const links: FooterLink[] = [
        { href: config.github, label: "GitHub", icon: Github, external: true },
        { href: config.linkedin, label: "LinkedIn", icon: Linkedin, external: true },
        { href: config.twitter, label: "Twitter", icon: Twitter, external: true },
        { href: config.email && `mailto:${config.email}`, label: "Email", icon: Mail },
        { href: "/feed.xml", label: "RSS feed", icon: Rss },
    ].filter((link) => Boolean(link.href));

    return (
        <footer className="border-t border-border bg-background/40 mt-6 sm:mt-8 py-5 sm:py-6">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Link href="/" className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors">
                            <span className="font-cinzel font-bold text-sm sm:text-base text-primary tracking-wide">Signature</span>
                        </Link>
                        <span className="text-muted-foreground/40" aria-hidden="true">•</span>
                        <span>© {currentYear}</span>
                    </div>

                    <nav aria-label="Social links" className="flex items-center gap-1.5 text-muted-foreground">
                        {links.map(({ href, label, icon: Icon, external }) => (
                            <a
                                key={label}
                                href={href}
                                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                className="p-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors"
                                title={label}
                                aria-label={label}
                            >
                                <Icon size={16} />
                            </a>
                        ))}
                    </nav>
                </div>
            </div>
        </footer>
    );
}
