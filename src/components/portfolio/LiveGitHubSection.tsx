"use client";

import React, { useEffect, useState } from "react";
import { Star, GitFork, ExternalLink, GitBranch, Terminal } from "lucide-react";

interface RepoItem {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    topics: string[];
    updated_at: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
    Python: "#3572A5",
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Java: "#b07219",
    Solidity: "#AA6746",
    Rust: "#dea584",
    Go: "#00ADD8",
    "C++": "#f34b7d",
    Shell: "#89e051",
    HTML: "#e34c26",
    CSS: "#563d7c",
};

export function LiveGitHubSection() {
    const [repos, setRepos] = useState<RepoItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchRepos() {
            try {
                const res = await fetch("/api/github/repos");
                if (!res.ok) throw new Error("Failed to load");
                const data = await res.json();
                if (mounted && data.repos) {
                    setRepos(data.repos);
                }
            } catch (err) {
                console.error("Error fetching live repos:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchRepos();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Terminal size={18} className="text-primary" />
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            Live GitHub Repositories
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Public codebase dispatches and algorithmic implementations synchronized directly from GitHub.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href="https://github.com/kmkrofficial"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors duration-150"
                    >
                        <span>github.com/kmkrofficial</span>
                        <ExternalLink size={12} />
                    </a>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="p-5 rounded-xl border border-border/60 bg-card/60 animate-pulse space-y-4"
                        >
                            <div className="h-5 bg-muted rounded w-1/2" />
                            <div className="space-y-2">
                                <div className="h-4 bg-muted rounded w-5/6" />
                                <div className="h-4 bg-muted rounded w-4/6" />
                            </div>
                            <div className="h-4 bg-muted rounded w-1/3 pt-2" />
                        </div>
                    ))}
                </div>
            ) : repos.length === 0 ? (
                <div className="p-8 rounded-xl border border-border/60 bg-card/40 text-center space-y-3">
                    <GitBranch className="mx-auto text-muted-foreground/60" size={32} />
                    <p className="text-sm text-muted-foreground">No public repositories currently exposed.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {repos.map((repo) => {
                        const langColor =
                            (repo.language && LANGUAGE_COLORS[repo.language]) || "var(--primary)";

                        return (
                            <a
                                key={repo.id}
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex flex-col justify-between p-5 rounded-xl bg-card border border-border/80 transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="font-mono text-base font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                            <GitBranch size={16} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                            <span className="truncate">{repo.name}</span>
                                        </h3>
                                        <ExternalLink
                                            size={14}
                                            className="text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1"
                                        />
                                    </div>

                                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                        {repo.description || "Open source software module and architectural implementation."}
                                    </p>

                                    {repo.topics && repo.topics.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {repo.topics.slice(0, 3).map((topic) => (
                                                <span
                                                    key={topic}
                                                    className="px-2 py-0.5 text-[10px] font-mono rounded bg-secondary/80 text-muted-foreground border border-border/60"
                                                >
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 mt-3 border-t border-border/40 font-mono">
                                    <div className="flex items-center gap-2">
                                        {repo.language && (
                                            <span className="flex items-center gap-1.5">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full inline-block"
                                                    style={{ backgroundColor: langColor }}
                                                />
                                                <span className="text-foreground/80 font-sans text-xs">{repo.language}</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1 hover:text-foreground transition-colors">
                                            <Star size={12} className="text-primary/80" />
                                            <span>{repo.stargazers_count}</span>
                                        </span>
                                        <span className="flex items-center gap-1 hover:text-foreground transition-colors">
                                            <GitFork size={12} className="text-muted-foreground" />
                                            <span>{repo.forks_count}</span>
                                        </span>
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
