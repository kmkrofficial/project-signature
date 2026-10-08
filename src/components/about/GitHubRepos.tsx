import { ExternalLink, GitFork, Star } from "lucide-react";
import { getRecentRepos } from "@/lib/github";

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

export async function GitHubRepos() {
    const repos = await getRecentRepos();

    return (
        <section aria-labelledby="github-heading" className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 id="github-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Recent open source
                </h2>
                <a
                    href="https://github.com/kmkrofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    github.com/kmkrofficial
                    <ExternalLink size={13} aria-hidden="true" className="transition-transform duration-200 ease-smooth group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repos.map((repo) => (
                    <li key={repo.id} className="reveal">
                        <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group lift press h-full flex flex-col justify-between gap-4 p-5 rounded-2xl bg-card border border-border/80 hover:border-primary/50"
                        >
                            <div className="space-y-2">
                                <h3 className="font-mono font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                    {repo.name}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{repo.description}</p>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                {repo.language ? (
                                    <span className="flex items-center gap-1.5">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: LANGUAGE_COLORS[repo.language] ?? "rgb(var(--primary))" }}
                                            aria-hidden="true"
                                        />
                                        {repo.language}
                                    </span>
                                ) : (
                                    <span />
                                )}
                                <span className="flex items-center gap-3">
                                    <span className="flex items-center gap-1" aria-label={`${repo.stars} stars`}>
                                        <Star size={12} aria-hidden="true" className="transition-transform duration-300 ease-spring group-hover:rotate-[72deg]" />
                                        {repo.stars}
                                    </span>
                                    <span className="flex items-center gap-1" aria-label={`${repo.forks} forks`}>
                                        <GitFork size={12} aria-hidden="true" />
                                        {repo.forks}
                                    </span>
                                </span>
                            </div>
                        </a>
                    </li>
                ))}
            </ul>
        </section>
    );
}
